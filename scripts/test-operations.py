import urllib.request
import json

BASE = "https://pravdhan-store.vercel.app/api/v1"

def req(url, method="GET", data=None, token=None):
    headers = {"Content-Type": "application/json"}
    if token:
        headers["Authorization"] = f"Bearer {token}"
    body = json.dumps(data).encode("utf-8") if data else None
    request = urllib.request.Request(url, data=body, headers=headers, method=method)
    try:
        with urllib.request.urlopen(request) as resp:
            return json.loads(resp.read().decode("utf-8"))
    except urllib.error.HTTPError as e:
        return json.loads(e.read().decode("utf-8"))

# 1. Admin login
admin_auth = req(f"{BASE}/auth/login", "POST", {"identifier": "admin@pravdhanstore.in", "password": "PravdhanAdmin@2026!"})
admin_token = admin_auth["data"]["token"]
print("1. Admin authenticated")

# 2. Check store fulfillment queue
orders = req(f"{BASE}/store/orders", "GET", token=admin_token).get("data", [])
print(f"2. Store fulfillment queue has {len(orders)} order(s)")
if not orders:
    print("No orders in store queue. Fetching admin orders...")
    admin_orders = req(f"{BASE}/admin/orders", "GET", token=admin_token).get("data", [])
    order_id = admin_orders[0]["id"]
else:
    order_id = orders[0]["id"]

print(f"Target Order ID: {order_id}")

# 3. Mark PREPARING
pick_res = req(f"{BASE}/store/orders/{order_id}/pick", "POST", token=admin_token)
status1 = pick_res.get("data", {}).get("orderStatus")
print(f"3. Marked PREPARING: {status1}")

# 4. Mark READY
ready_res = req(f"{BASE}/store/orders/{order_id}/ready", "POST", token=admin_token)
status2 = ready_res.get("data", {}).get("orderStatus")
print(f"4. Marked READY: {status2}")

# 5. Check dispatch queue & list riders
queue = req(f"{BASE}/admin/dispatch/queue", "GET", token=admin_token).get("data", [])
riders = req(f"{BASE}/admin/dispatch/assignments", "GET", token=admin_token).get("data", [])
rider_id = riders[0]["id"]
rider_name = riders[0]["name"]
print(f"5. Dispatch queue: {len(queue)} order(s). Selected Rider: {rider_name} ({rider_id})")

# 6. Assign Rider
assign_res = req(f"{BASE}/admin/dispatch/assignments", "POST", {"orderId": order_id, "riderId": rider_id, "notes": "Deliver to Sector 14 Gate 2"}, token=admin_token)
assignment = assign_res["data"]["assignment"]
assignment_id = assignment["id"]
customer_otp = assignment["customerOtp"]
order_status_post_assign = assign_res["data"]["order"]["orderStatus"]
print(f"6. Rider Assigned! Assignment ID: {assignment_id}, Customer OTP: {customer_otp}, Order Status: {order_status_post_assign}")

# 7. Rider Login
rider_auth = req(f"{BASE}/auth/login", "POST", {"identifier": "rider@pravdhanstore.in", "password": "PravdhanAdmin@2026!"})
rider_token = rider_auth["data"]["token"]
print(f"7. Rider {rider_auth['data']['user']['name']} logged in successfully")

# 8. Rider Accept
accept_res = req(f"{BASE}/rider/assignments/{assignment_id}/accept", "POST", token=rider_token)
print(f"8. Assignment Accepted: status = {accept_res.get('data', {}).get('status')}")

# 9. Rider Pickup from store
pickup_res = req(f"{BASE}/rider/assignments/{assignment_id}/pickup", "POST", token=rider_token)
print(f"9. Assignment Picked Up: status = {pickup_res.get('data', {}).get('status')}")

# 10. Rider Deliver with OTP
deliver_res = req(f"{BASE}/rider/assignments/{assignment_id}/deliver", "POST", {"customerOtp": customer_otp}, token=rider_token)
print(f"10. Assignment Delivered: status = {deliver_res.get('data', {}).get('status')}")

# 11. Final verification of order in Super Admin Dashboard
dash = req(f"{BASE}/admin/dashboard", "GET", token=admin_token).get("data", {})
print("11. Super Admin Dashboard after delivery:")
print(json.dumps(dash, indent=2))
