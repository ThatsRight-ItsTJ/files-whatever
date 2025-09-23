#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { z } from 'zod';

const server = new Server(
  {
    name: 'seeding-orchestrator',
    version: '1.0.0',
    description: 'Unified database seeding orchestrator for multiple ORMs',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Project detection and seeding strategies
const detectProjectType = (projectPath: string): 'prisma' | 'django' | 'alembic' | 'sequelize' | 'unknown' => {
  const fs = require('fs');
  const path = require('path');
  
  // Check for Prisma
  if (fs.existsSync(path.join(projectPath, 'prisma', 'schema.prisma'))) {
    return 'prisma';
  }
  
  // Check for Django
  if (fs.existsSync(path.join(projectPath, 'manage.py')) && 
      fs.existsSync(path.join(projectPath, 'settings.py'))) {
    return 'django';
  }
  
  // Check for Alembic
  if (fs.existsSync(path.join(projectPath, 'alembic.ini')) && 
      fs.existsSync(path.join(projectPath, 'alembic'))) {
    return 'alembic';
  }
  
  // Check for Sequelize
  if (fs.existsSync(path.join(projectPath, 'config', 'database.js')) || 
      fs.existsSync(path.join(projectPath, 'sequelize.js'))) {
    return 'sequelize';
  }
  
  return 'unknown';
};

// Execute shell command
const executeCommand = async (command: string, cwd: string): Promise<{ stdout: string; stderr: string; success: boolean }> => {
  const { exec } = require('child_process');
  const path = require('path');
  
  return new Promise((resolve) => {
    exec(command, { cwd: path.resolve(cwd) }, (error: any, stdout: string, stderr: string) => {
      resolve({
        stdout,
        stderr,
        success: !error,
      });
    });
  });
};

// Prisma seeding
const seedPrisma = async (projectPath: string, env: string = 'development'): Promise<{ success: boolean; message: string; output?: string }> => {
  try {
    const { stdout, stderr, success } = await executeCommand(
      `npx prisma db seed --preview-feature`,
      projectPath
    );
    
    if (success) {
      return {
        success: true,
        message: 'Prisma database seeded successfully',
        output: stdout,
      };
    } else {
      return {
        success: false,
        message: 'Prisma seeding failed',
        output: stderr,
      };
    }
  } catch (error) {
    return {
      success: false,
      message: `Prisma seeding error: ${error instanceof Error ? error.message : String(error)}`,
    };
  }
};

// Django seeding
const seedDjango = async (projectPath: string, env: string = 'development'): Promise<{ success: boolean; message: string; output?: string }> => {
  try {
    const { stdout, stderr, success } = await executeCommand(
      `python manage.py loaddata fixtures/*.json`,
      projectPath
    );
    
    if (success) {
      return {
        success: true,
        message: 'Django database seeded successfully',
        output: stdout,
      };
    } else {
      return {
        success: false,
        message: 'Django seeding failed',
        output: stderr,
      };
    }
  } catch (error) {
    return {
      success: false,
      message: `Django seeding error: ${error instanceof Error ? error.message : String(error)}`,
    };
  }
};

// Alembic seeding
const seedAlembic = async (projectPath: string, env: string = 'development'): Promise<{ success: boolean; message: string; output?: string }> => {
  try {
    const { stdout, stderr, success } = await executeCommand(
      `alembic upgrade head`,
      projectPath
    );
    
    if (success) {
      return {
        success: true,
        message: 'Alembic database seeded successfully',
        output: stdout,
      };
    } else {
      return {
        success: false,
        message: 'Alembic seeding failed',
        output: stderr,
      };
    }
  } catch (error) {
    return {
      success: false,
      message: `Alembic seeding error: ${error instanceof Error ? error.message : String(error)}`,
    };
  }
};

// Sequelize seeding
const seedSequelize = async (projectPath: string, env: string = 'development'): Promise<{ success: boolean; message: string; output?: string }> => {
  try {
    const { stdout, stderr, success } = await executeCommand(
      `npx sequelize-cli db:seed:all`,
      projectPath
    );
    
    if (success) {
      return {
        success: true,
        message: 'Sequelize database seeded successfully',
        output: stdout,
      };
    } else {
      return {
        success: false,
        message: 'Sequelize seeding failed',
        output: stderr,
      };
    }
  } catch (error) {
    return {
      success: false,
      message: `Sequelize seeding error: ${error instanceof Error ? error.message : String(error)}`,
    };
  }
};

server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: 'seed',
        description: 'Seed database for detected project type (Prisma, Django, Alembic, Sequelize)',
        inputSchema: {
          type: 'object',
          properties: {
            projectPath: {
              type: 'string',
              description: 'Path to the project directory',
            },
            env: {
              type: 'string',
              description: 'Environment (development, production, test)',
              default: 'development',
            },
            force: {
              type: 'boolean',
              description: 'Force re-seeding even if database already exists',
              default: false,
            },
          },
          required: ['projectPath'],
        },
      },
      {
        name: 'detect_project_type',
        description: 'Detect the project type based on configuration files',
        inputSchema: {
          type: 'object',
          properties: {
            projectPath: {
              type: 'string',
              description: 'Path to the project directory',
            },
          },
          required: ['projectPath'],
        },
      },
      {
        name: 'list_seeders',
        description: 'List available seeders for the detected project type',
        inputSchema: {
          type: 'object',
          properties: {
            projectPath: {
              type: 'string',
              description: 'Path to the project directory',
            },
          },
          required: ['projectPath'],
        },
      },
    ],
  };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    switch (name) {
      case 'seed':
        return await seedProject(args);
      case 'detect_project_type':
        return await detectProjectTypeHandler(args);
      case 'list_seeders':
        return await listSeedersHandler(args);
      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  } catch (error) {
    console.error(`Error executing tool ${name}:`, error);
    throw error;
  }
});

async function seedProject(args: any) {
  const { projectPath, env = 'development', force = false } = args;
  
  try {
    const projectType = detectProjectType(projectPath);
    
    if (projectType === 'unknown') {
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              success: false,
              message: 'Could not detect project type. Supported types: Prisma, Django, Alembic, Sequelize',
              projectPath,
              detectedFiles: [],
            }, null, 2),
          },
        ],
      };
    }

    let result;
    switch (projectType) {
      case 'prisma':
        result = await seedPrisma(projectPath, env);
        break;
      case 'django':
        result = await seedDjango(projectPath, env);
        break;
      case 'alembic':
        result = await seedAlembic(projectPath, env);
        break;
      case 'sequelize':
        result = await seedSequelize(projectPath, env);
        break;
    }

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            success: result.success,
            message: result.message,
            projectType,
            projectPath,
            env,
            output: result.output,
            timestamp: new Date().toISOString(),
          }, null, 2),
        },
      ],
    };
  } catch (error) {
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            success: false,
            message: `Seeding failed: ${error instanceof Error ? error.message : String(error)}`,
            projectPath,
            timestamp: new Date().toISOString(),
          }, null, 2),
        },
      ],
    };
  }
}

async function detectProjectTypeHandler(args: any) {
  const { projectPath } = args;
  
  try {
    const projectType = detectProjectType(projectPath);
    const fs = require('fs');
    const path = require('path');
    
    // Check for specific files
    const detectedFiles: Array<{type: string; file: string; path: string}> = [];
    const checks = [
      { type: 'prisma', file: 'prisma/schema.prisma' },
      { type: 'django', file: 'manage.py' },
      { type: 'django', file: 'settings.py' },
      { type: 'alembic', file: 'alembic.ini' },
      { type: 'sequelize', file: 'config/database.js' },
      { type: 'sequelize', file: 'sequelize.js' },
    ];
    
    checks.forEach(check => {
      if (fs.existsSync(path.join(projectPath, check.file))) {
        detectedFiles.push({
          type: check.type,
          file: check.file,
          path: path.join(projectPath, check.file),
        });
      }
    });

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            success: true,
            projectType,
            projectPath,
            detectedFiles,
            timestamp: new Date().toISOString(),
          }, null, 2),
        },
      ],
    };
  } catch (error) {
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            success: false,
            message: `Detection failed: ${error instanceof Error ? error.message : String(error)}`,
            projectPath,
            timestamp: new Date().toISOString(),
          }, null, 2),
        },
      ],
    };
  }
}

async function listSeedersHandler(args: any) {
  const { projectPath } = args;
  
  try {
    const projectType = detectProjectType(projectPath);
    const fs = require('fs');
    const path = require('path');
    
    let seeders = [];
    
    switch (projectType) {
      case 'prisma':
        // Look for seed files in prisma/seed directory
        const prismaSeedDir = path.join(projectPath, 'prisma', 'seed');
        if (fs.existsSync(prismaSeedDir)) {
          const files = fs.readdirSync(prismaSeedDir);
          seeders = files.filter((f: string) => f.endsWith('.ts') || f.endsWith('.js')).map((f: string) => ({
            name: f,
            path: path.join(prismaSeedDir, f),
            type: 'prisma-seeder',
          }));
        }
        break;
        
      case 'django':
        // Look for fixtures directory
        const fixturesDir = path.join(projectPath, 'fixtures');
        if (fs.existsSync(fixturesDir)) {
          const files = fs.readdirSync(fixturesDir);
          seeders = files.filter((f: string) => f.endsWith('.json')).map((f: string) => ({
            name: f,
            path: path.join(fixturesDir, f),
            type: 'django-fixture',
          }));
        }
        break;
        
      case 'alembic':
        // Look for seed scripts in alembic/versions
        const alembicDir = path.join(projectPath, 'alembic', 'versions');
        if (fs.existsSync(alembicDir)) {
          const files = fs.readdirSync(alembicDir);
          seeders = files.filter((f: string) => f.includes('seed') && (f.endsWith('.py'))).map((f: string) => ({
            name: f,
            path: path.join(alembicDir, f),
            type: 'alembic-seeder',
          }));
        }
        break;
        
      case 'sequelize':
        // Look for seed files in seeders directory
        const sequelizeSeedDir = path.join(projectPath, 'seeders');
        if (fs.existsSync(sequelizeSeedDir)) {
          const files = fs.readdirSync(sequelizeSeedDir);
          seeders = files.filter((f: string) => f.endsWith('.js')).map((f: string) => ({
            name: f,
            path: path.join(sequelizeSeedDir, f),
            type: 'sequelize-seeder',
          }));
        }
        break;
    }

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            success: true,
            projectType,
            projectPath,
            seeders,
            timestamp: new Date().toISOString(),
          }, null, 2),
        },
      ],
    };
  } catch (error) {
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            success: false,
            message: `Failed to list seeders: ${error instanceof Error ? error.message : String(error)}`,
            projectPath,
            timestamp: new Date().toISOString(),
          }, null, 2),
        },
      ],
    };
  }
}

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('Seeding Orchestrator MCP server running on stdio');
}

main().catch((error) => {
  console.error('Server error:', error);
  process.exit(1);
});