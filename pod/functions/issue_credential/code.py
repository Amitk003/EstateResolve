#function_name: issue_credential
#input_type_name: IssueCredentialInput
#output_type_name: IssueCredentialOutput

from pydantic import BaseModel
from lemma_sdk import FunctionContext
from datetime import datetime, timezone


class DeathDetails(BaseModel):
    deceased_name: str
    date_of_death: str
    place_of_death: str
    ssn: str
    cause_of_death: str
    date_of_birth: str


class IssueCredentialInput(BaseModel):
    death_details: DeathDetails
    issuer_name: str
    executor_name: str
    executor_authorization: str


class IssueCredentialOutput(BaseModel):
    credential_id: str
    issuer_did: str
    issuance_date: str
    schema_id: str
    proof: dict


async def issue_credential(ctx: FunctionContext, data: IssueCredentialInput) -> IssueCredentialOutput:
    dd = data.death_details

    credential_id = f"vc:death_cert:{datetime.now(timezone.utc).strftime('%Y%m%d%H%M%S')}"

    output = IssueCredentialOutput(
        credential_id=credential_id,
        issuer_did=f"did:lemma:{data.issuer_name.lower().replace(' ', '_')}",
        issuance_date=datetime.now(timezone.utc).isoformat(),
        schema_id="schema:death_certificate:v1",
        proof={
            "type": "BBSPlusSignature2024",
            "verificationMethod": f"did:lemma:{data.issuer_name.lower().replace(' ', '_')}#keys-1",
            "proofPurpose": "assertionMethod",
            "proofValue": f"mock_zk_proof_for_{credential_id}",
            "attributes": {
                "legal_name": {
                    "value": dd.deceased_name,
                    "revealed": True
                },
                "date_of_death": {
                    "value": dd.date_of_death,
                    "revealed": True
                },
                "date_of_birth": {
                    "value": dd.date_of_birth,
                    "revealed": False
                },
                "ssn": {
                    "value": dd.ssn[-4:],
                    "revealed": False
                },
                "cause_of_death": {
                    "value": dd.cause_of_death,
                    "revealed": False
                },
                "executor_authorization_status": {
                    "value": data.executor_authorization,
                    "revealed": False
                }
            }
        }
    )

    return output
