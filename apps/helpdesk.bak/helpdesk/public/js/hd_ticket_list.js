frappe.listview_settings["HD Ticket"] = {
  onload(listview) {
    console.log("HD Ticket ListView loaded ✅");

    // expose function globally so we can test in console
    window.bulkAssignSelectedTickets = async function () {
      console.log("bulkAssignSelectedTickets() called");

      // get selected tickets
      const selected = listview.get_checked_items().map(row => row.name);
      console.log("Selected tickets:", selected);

      if (!selected.length) {
        frappe.msgprint("No tickets selected.");
        return;
      }

      // ask for agent
      const agent = await new Promise((resolve) => {
        frappe.prompt(
          [
            {
              label:
                "Enter either:\n- HD Agent name (ex: the Agent docname), OR\n- the User / email of that agent",
              fieldname: "agent",
              fieldtype: "Data",
              reqd: 1,
            },
          ],
          (values) => resolve(values.agent),
          "Assign all selected tickets to which agent?",
          "OK"
        );
      });

      if (!agent) {
        frappe.msgprint("No agent entered, cancelled.");
        return;
      }

      // CSRF
      const csrfToken =
        window.csrf_token ||
        window.CSRF_TOKEN ||
        (window.frappe && window.frappe.csrf_token);

      for (const ticket_id of selected) {
        try {
          const res = await fetch(
            "/api/method/helpdesk.api.ticket.bulk_assign_single",
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "X-Frappe-CSRF-Token": csrfToken,
              },
              credentials: "include",
              body: JSON.stringify({
                ticket_id,
                agent,
              }),
            }
          );

          if (!res.ok) {
            const err = await res.json().catch(() => ({}));
            console.error("Failed assigning", ticket_id, err);
            frappe.msgprint(
              `Failed assigning ${ticket_id}: ${err?.message || res.status}`
            );
            continue;
          }

          console.log(`Assigned ${ticket_id} -> ${agent}`);
        } catch (e) {
          console.error("Error assigning", ticket_id, e);
        }
      }

      // reload list so "Assigned To" column updates
      listview.refresh();
    };

    // add the dropdown action in the bulk menu
    listview.page.add_actions_menu_item(
      __("Assign to Agent"),
      () => {
        window.bulkAssignSelectedTickets();
      },
      false
    );
  },
};
