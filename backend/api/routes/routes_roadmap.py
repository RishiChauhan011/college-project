from fastapi import APIRouter

router = APIRouter()

@router.get("/roadmap")
def get_roadmap():
    return {"message": "Roadmap route not implemented yet"}
