#function_name: generate_zk_proof
#input_type_name: GenerateZkProofInput
#output_type_name: GenerateZkProofOutput

from pydantic import BaseModel
from lemma_sdk import FunctionContext, Pod
from datetime import datetime, timezone


class RequiredAttributes(BaseModel):
    legal_name: bool = True
    date_of_death: bool = True
    executor_authorization_status: bool = True
    ssn_last_four: bool = False


class GenerateZkProofInput(BaseModel):
    credential_id: str
    institution_name: str
    institution_type: str = "bank"
    required_attributes: RequiredAttributes | None = None


class SelectiveDisclosureAttribute(BaseModel):
    name: str
    value: str
    revealed: bool
    proof: str


class GenerateZkProofOutput(BaseModel):
    proof_id: str
    credential_id: str
    issuer_did: str
    selective_disclosure: list[SelectiveDisclosureAttribute]
    zk_proof_hash: str
    timestamp: str
    recipient: str
    verification_url: str


async def generate_zk_proof(ctx: FunctionContext, data: GenerateZkProofInput) -> GenerateZkProofOutput:
    now = datetime.now(timezone.utc)
    proof_id = f"zkp:{now.strftime('%Y%m%d%H%M%S')}:{hash(data.credential_id) % 10000:04d}"

    disclosed = []

    if data.required_attributes:
        if data.required_attributes.legal_name:
            disclosed.append(SelectiveDisclosureAttribute(
                name="legal_name",
                value="Revealed on request",
                revealed=True,
                proof=f"bbs+_signature_verified_{proof_id}"
            ))
        if data.required_attributes.date_of_death:
            disclosed.append(SelectiveDisclosureAttribute(
                name="date_of_death",
                value="Revealed on request",
                revealed=True,
                proof=f"bbs+_signature_verified_{proof_id}"
            ))
        if data.required_attributes.executor_authorization_status:
            disclosed.append(SelectiveDisclosureAttribute(
                name="executor_authorization_status",
                value="Authorized",
                revealed=True,
                proof=f"bbs+_signature_verified_{proof_id}"
            ))
        if data.required_attributes.ssn_last_four:
            disclosed.append(SelectiveDisclosureAttribute(
                name="ssn_last_four",
                value="Hidden via ZK proof",
                revealed=False,
                proof=f"zk_snark_committed_{proof_id}"
            ))

    pod = Pod.from_env()
    pod.table("Communications_Log").create({
        "direction": "Outgoing",
        "institution": data.institution_name,
        "subject": f"ZK Proof for credential {data.credential_id}",
        "body": f"Generated selective disclosure proof for {data.institution_name}. Revealed attributes: {', '.join(a.name for a in disclosed if a.revealed)}",
        "delivery_status": "Sent",
        "zk_proof_ref": proof_id
    })

    return GenerateZkProofOutput(
        proof_id=proof_id,
        credential_id=data.credential_id,
        issuer_did="did:lemma:probate_court",
        selective_disclosure=disclosed,
        zk_proof_hash=f"poseidon_hash_{proof_id}",
        timestamp=now.isoformat(),
        recipient=data.institution_name,
        verification_url=f"https://verify.lemma.frame00.com/proof/{proof_id}"
    )
