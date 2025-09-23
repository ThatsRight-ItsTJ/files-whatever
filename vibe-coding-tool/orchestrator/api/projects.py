from fastapi import APIRouter, Depends, HTTPException
from typing import List
from datetime import datetime
import uuid

from models.project import Project, ProjectCreate
from core.project_service import ProjectService
from core.auth_service import get_current_user
from api.response import StandardResponse

router = APIRouter()

@router.post("/projects", response_model=StandardResponse[Project])
async def create_project(
    project: ProjectCreate,
    current_user: str = Depends(get_current_user),
    project_service: ProjectService = Depends()
):
    """Create a new project"""
    try:
        project_obj = Project(
            id=str(uuid.uuid4()),
            user_id=current_user,
            name=project.name,
            description=project.description,
            github_repo=project.github_repo,
            hf_dataset=project.hf_dataset,
            created_at=datetime.utcnow()
        )
        
        saved_project = await project_service.create_project(project_obj)
        
        return StandardResponse(
            success=True,
            data=saved_project,
            message="Project created successfully"
        )
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/projects/{project_id}", response_model=StandardResponse[Project])
async def get_project(
    project_id: str,
    current_user: str = Depends(get_current_user),
    project_service: ProjectService = Depends()
):
    """Get project details"""
    try:
        project = await project_service.get_project(project_id, current_user)
        if not project:
            raise HTTPException(status_code=404, detail="Project not found")
        
        return StandardResponse(
            success=True,
            data=project,
            message="Project retrieved successfully"
        )
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/projects", response_model=StandardResponse[List[Project]])
async def list_projects(
    current_user: str = Depends(get_current_user),
    project_service: ProjectService = Depends()
):
    """List user's projects"""
    try:
        projects = await project_service.list_projects(current_user)
        
        return StandardResponse(
            success=True,
            data=projects,
            message="Projects retrieved successfully"
        )
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))