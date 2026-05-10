def generate_complaint_letter(issue_type: str, location: str, description: str) -> str:
    letter = (
        f"To the Municipal Authority,\n\n"
        f"Subject: Complaint for {issue_type}\n\n"
        f"I am writing to report a civic issue classified as '{issue_type}'. "
        f"The location is: {location}. "
        f"Details: {description}.\n\n"
        f"Please take prompt action to inspect and resolve this issue. "
        f"I request that the appropriate department review and fix this as soon as possible.\n\n"
        f"Sincerely,\n"
        f"A concerned citizen"
    )
    return letter
