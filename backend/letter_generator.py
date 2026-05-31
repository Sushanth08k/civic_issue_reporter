def generate_complaint_letter(issue_type: str, location: str, description: str) -> str:
    return f"""
To,
The Municipal Commissioner
Municipal Authority

Subject: Request for Immediate Action Regarding {issue_type}

Respected Sir/Madam,

I am writing to bring to your attention a civic issue concerning {issue_type} at the following location:

Location: {location}

Issue Description:
{description}

This issue is causing inconvenience to residents and may pose risks to public safety, health, or the environment if not addressed promptly. I kindly request the concerned department to inspect the situation and take the necessary corrective measures at the earliest.

I would appreciate it if appropriate action could be initiated and the issue resolved as soon as possible. Your prompt attention to this matter will greatly benefit the local community.

Thank you for your time and consideration. I look forward to a positive response.

Yours faithfully,

A Concerned Citizen
""".strip()