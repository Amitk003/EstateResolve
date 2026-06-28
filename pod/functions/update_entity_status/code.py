#function_name: update_entity_status
#input_type_name: UpdateStatusInput
#output_type_name: UpdateStatusOutput

from pydantic import BaseModel
from lemma_sdk import FunctionContext, Pod


class UpdateStatusInput(BaseModel):
    entity_id: str
    new_status: str
    feedback: str | None = None
    task_id: str | None = None


class UpdateStatusOutput(BaseModel):
    status: str
    entity_id: str


async def update_entity_status(ctx: FunctionContext, data: UpdateStatusInput) -> UpdateStatusOutput:
    pod = Pod.from_env()

    update_data = {"resolution_status": data.new_status}
    if data.feedback:
        update_data["description"] = f"Rejected. Feedback: {data.feedback}"

    pod.table("Estate_Inventory").update(data.entity_id, update_data)

    return UpdateStatusOutput(
        status=data.new_status,
        entity_id=data.entity_id
    )
