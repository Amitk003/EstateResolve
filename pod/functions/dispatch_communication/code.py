#function_name: dispatch_communication
#input_type_name: DispatchInput
#output_type_name: DispatchOutput

from pydantic import BaseModel
from lemma_sdk import FunctionContext, Pod


class DispatchInput(BaseModel):
    entity_id: str
    institution_name: str
    draft_payload: dict


class DispatchOutput(BaseModel):
    status: str
    task_id: str


async def dispatch_communication(ctx: FunctionContext, data: DispatchInput) -> DispatchOutput:
    pod = Pod.from_env()

    action_records = pod.table("Action_Queue").list(
        filter=[{"field": "related_entity_id", "op": "eq", "value": data.entity_id}],
        sort=[{"field": "created_at", "direction": "desc"}],
        limit=1
    )

    actions = action_records.to_dict().get("items", [])
    task_id = actions[0]["id"] if actions else "unknown"

    pod.table("Action_Queue").update(task_id, {"human_approval_status": "Executed"})

    log = pod.table("Communications_Log").create({
        "direction": "Outgoing",
        "institution": data.institution_name,
        "subject": data.draft_payload.get("subject", "Notice of Death"),
        "body": data.draft_payload.get("body", str(data.draft_payload)),
        "delivery_status": "Sent",
        "related_task_id": task_id
    })

    return DispatchOutput(
        status="sent",
        task_id=str(log["id"])
    )
