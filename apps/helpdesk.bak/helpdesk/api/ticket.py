import frappe

@frappe.whitelist(methods=["POST"])
def bulk_assign_single(ticket_id: str, agent: str):
    # assign one ticket to one agent
    ticket = frappe.get_doc("HD Ticket", ticket_id)
    ticket.assign_agent(agent)
    frappe.db.commit()
    return {"ok": True}


@frappe.whitelist()
def get_assignable_agents():
    # send list of agents for the dropdown
    users = frappe.get_all(
        "User",
        filters={"enabled": 1},
        fields=["name"],
        limit_page_length=100,
    )
    return users
