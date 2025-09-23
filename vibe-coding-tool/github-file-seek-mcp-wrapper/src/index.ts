#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { glob } from 'glob';
import minimatch from 'minimatch';
import { Octokit } from '@octokit/rest';

const server = new Server(
  {
    name: 'github-file-seek-wrapper',
    version: '1.0.0',
    description: 'GitHub File Seek wrapper with enhanced search capabilities',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Global cache for GitHub API responses
const githubCache = new Map<string, { data: any; timestamp: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

// Get cached GitHub data or fetch fresh data
async function getCachedGitHubData(key: string, fetchFn: () => Promise<any>) {
  const cached = githubCache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data;
  }
  
  const data = await fetchFn();
  githubCache.set(key, { data, timestamp: Date.now() });
  return data;
}

// Enhanced find_files tool with glob patterns and recursive search
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: 'find_files',
        description: 'Find files in a GitHub repository using glob patterns and regex',
        inputSchema: {
          type: 'object',
          properties: {
            owner: {
              type: 'string',
              description: 'Repository owner (username or organization)',
            },
            repo: {
              type: 'string',
              description: 'Repository name',
            },
            pattern: {
              type: 'string',
              description: 'Glob pattern or regex to match files (e.g., "**/*.ts", "src/**/*")',
            },
            branch: {
              type: 'string',
              description: 'Branch name (default: main)',
              default: 'main',
            },
            maxResults: {
              type: 'number',
              description: 'Maximum number of results to return',
              default: 100,
            },
          },
          required: ['owner', 'repo', 'pattern'],
        },
      },
      {
        name: 'download_files',
        description: 'Download multiple files from a GitHub repository',
        inputSchema: {
          type: 'object',
          properties: {
            owner: {
              type: 'string',
              description: 'Repository owner (username or organization)',
            },
            repo: {
              type: 'string',
              description: 'Repository name',
            },
            files: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  path: {
                    type: 'string',
                    description: 'File path in the repository',
                  },
                  branch: {
                    type: 'string',
                    description: 'Branch name (default: main)',
                    default: 'main',
                  },
                },
                required: ['path'],
              },
              description: 'List of files to download',
            },
          },
          required: ['owner', 'repo', 'files'],
        },
      },
      {
        name: 'search_code',
        description: 'Search for code patterns across a GitHub repository',
        inputSchema: {
          type: 'object',
          properties: {
            owner: {
              type: 'string',
              description: 'Repository owner (username or organization)',
            },
            repo: {
              type: 'string',
              description: 'Repository name',
            },
            query: {
              type: 'string',
              description: 'Search query (supports code search syntax)',
            },
            extension: {
              type: 'string',
              description: 'File extension to filter by (e.g., "ts", "py")',
            },
          },
          required: ['owner', 'repo', 'query'],
        },
      },
    ],
  };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    switch (name) {
      case 'find_files':
        return await findFiles(args);
      case 'download_files':
        return await downloadFiles(args);
      case 'search_code':
        return await searchCode(args);
      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  } catch (error) {
    console.error(`Error executing tool ${name}:`, error);
    throw error;
  }
});

async function findFiles(args: any) {
  const { owner, repo, pattern, branch = 'main', maxResults = 100 } = args;
  
  try {
    // Get repository contents using GitHub API
    const octokit = new Octokit();
    const cacheKey = `${owner}/${repo}/tree/${branch}`;
    
    const treeData = await getCachedGitHubData(cacheKey, async () => {
      const { data } = await octokit.rest.repos.getContent({
        owner,
        repo,
        path: '',
        ref: branch,
      });
      return data;
    });

    // Extract file paths from the repository tree
    const filePaths: string[] = [];
    
    function extractPaths(item: any, currentPath = '') {
      if (item.type === 'file') {
        const fullPath = currentPath ? `${currentPath}/${item.path}` : item.path;
        filePaths.push(fullPath);
      } else if (item.type === 'dir') {
        const dirPath = currentPath ? `${currentPath}/${item.path}` : item.path;
        // For directories, we need to get their contents
        extractPathsFromDir(dirPath);
      }
    }

    async function extractPathsFromDir(dirPath: string) {
      const dirCacheKey = `${owner}/${repo}/contents/${dirPath}`;
      const dirContents = await getCachedGitHubData(dirCacheKey, async () => {
        const { data } = await octokit.rest.repos.getContent({
          owner,
          repo,
          path: dirPath,
          ref: branch,
        });
        return data;
      });

      if (Array.isArray(dirContents)) {
        dirContents.forEach(item => extractPaths(item, dirPath));
      }
    }

    if (Array.isArray(treeData)) {
      treeData.forEach(item => extractPaths(item));
    }

    // Filter files using glob pattern
    const matchedFiles = filePaths.filter(filePath => {
      try {
        return minimatch.minimatch(filePath, pattern, { matchBase: false });
      } catch {
        // Fallback to simple string matching if glob fails
        return filePath.includes(pattern);
      }
    });

    // Limit results
    const limitedFiles = matchedFiles.slice(0, maxResults);

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            found: limitedFiles.length,
            files: limitedFiles,
            pattern,
            branch,
          }, null, 2),
        },
      ],
    };
  } catch (error) {
    console.error('Error finding files:', error);
    throw new Error(`Failed to find files: ${error instanceof Error ? error.message : String(error)}`);
  }
}

async function downloadFiles(args: any) {
  const { owner, repo, files } = args;
  
  try {
    const octokit = new Octokit();
    const downloadedFiles: any[] = [];

    for (const file of files) {
      const { path, branch = 'main' } = file;
      
      try {
        const { data } = await octokit.rest.repos.getContent({
          owner,
          repo,
          path,
          ref: branch,
        });

        if (Array.isArray(data)) {
          // Handle array response (directory listing)
          const file = data.find((item: any) => item.path === path);
          if (file && file.type === 'file' && 'content' in file && file.content) {
            const content = Buffer.from(file.content, 'base64').toString('utf-8');
            downloadedFiles.push({
              path,
              content,
              size: file.size,
              sha: file.sha,
            });
          }
        } else if (data.type === 'file' && 'content' in data && data.content) {
          // Handle single file response
          const content = Buffer.from(data.content, 'base64').toString('utf-8');
          downloadedFiles.push({
            path,
            content,
            size: data.size,
            sha: data.sha,
          });
        }
      } catch (error) {
        console.warn(`Failed to download ${path}:`, error);
        downloadedFiles.push({
          path,
          error: error instanceof Error ? error.message : String(error),
        });
      }
    }

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            downloaded: downloadedFiles.filter(f => !f.error).length,
            total: files.length,
            files: downloadedFiles,
          }, null, 2),
        },
      ],
    };
  } catch (error) {
    console.error('Error downloading files:', error);
    throw new Error(`Failed to download files: ${error instanceof Error ? error.message : String(error)}`);
  }
}

async function searchCode(args: any) {
  const { owner, repo, query, extension } = args;
  
  try {
    const octokit = new Octokit();
    
    // Use GitHub's code search API
    const searchQuery = `${query} repo:${owner}/${repo}${extension ? ` extension:${extension}` : ''}`;
    
    const { data } = await octokit.rest.search.code({
      q: searchQuery,
      per_page: 100,
    });

    const results = data.items.map((item: any) => ({
      path: item.path,
      sha: item.sha,
      html_url: item.html_url,
      repository: item.repository.full_name,
    }));

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            query: searchQuery,
            total: results.length,
            results,
          }, null, 2),
        },
      ],
    };
  } catch (error) {
    console.error('Error searching code:', error);
    throw new Error(`Failed to search code: ${error instanceof Error ? error.message : String(error)}`);
  }
}

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('GitHub File Seek MCP server running on stdio');
}

main().catch((error) => {
  console.error('Server error:', error);
  process.exit(1);
});