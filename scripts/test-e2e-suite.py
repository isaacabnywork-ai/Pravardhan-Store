import urllib.request
import json
import time

BASE = "https://pravdhan-store.vercel.app/api/v1"

def req(url, method="GET", data=None, token=None):
    headers = {"Content-Type": "application/json"}
    if token:
        headers["Authorization"] = f"Bearer {token}"
    body = json.dumps(data).encode("utf-8") if data else None
    request = urllib.request.Request(url, data=body, headers=headers, method=method)
    try:
        with urllib.request.urlopen(request) as resp:
            return resp.status, json.loads(resp.read().decode("utf-8"))
    except urllib.error.HTTPError as e:
        return e.code, json.loads(e.read().decode("utf-8"))

def run_suite():
    print("=" * 70)
    print("🧪 PRAVDHAN STORE - COMPLETE BACKEND E2E VERIFICATION SUITE")
    print("=" * 70)

    # 1. Health
    status, res = req(f"{BASE}/health")
    assert status == 200, f"Health check failed: {res}"
    print(f"✅ 1. System Health: {res['data']['status']} (Neon latency: {res['data']['database']['latencyMs']}ms)")

    # 2. Catalog
    status, res = req(f"{BASE}/categories")
    assert status == 200, f"Categories failed: {res}"
    cat_count = len(res['data'])
    status, res = req(f"{BASE}/products?pageSize=2")
    assert status == 200, f"Products failed: {res}"
    total_prods = res['pagination']['total']
    print(f"✅ 2. Catalog: {cat_count} categories, {total_prods} products available")

    # 3. Serviceability
    status, res = req(f"{BASE}/serviceability?pincode=122001")
    assert res['data']['isServiceable'] is True, "Pincode 122001 should be serviceable"
    status, res = req(f"{BASE}/serviceability?pincode=110001")
    assert res['data']['isServiceable'] is False, "Pincode 110001 should NOT be serviceable"
    print("✅ 3. Serviceability: Gurugram active (122001), Delhi gated (110001)")

    # 4. Super Admin Login
    status, res = req(f"{BASE}/auth/login", "POST", {
        "identifier": "admin@pravdhanstore.in",
        "password": "PravdhanAdmin@2026!"
    })
    assert status == 200, f"Admin login failed: {res}"
    admin_token = res['data']['token']
    print(f"✅ 4. Super Admin Authentication: Token acquired for {res['data']['user']['name']}")

    # 5. Customer OTP & Profile
    phone = "+919999000000"
    status, res = req(f"{BASE}/auth/otp/request", "POST", {"phone": phone})
    assert status == 200, f"OTP request failed: {res}"
    status, res = req(f"{BASE}/auth/otp/verify", "POST", {"phone": phone, "otp": "123456"})
    assert status in [200, 201], f"OTP verify failed: {res}"
    cust_token = res['data']['token']
    cust_id = res['data']['user']['id']
    print(f"✅ 5. Customer Authentication: Phone OTP verified for {phone} ({cust_id})")

    # 6. Persistent Cart & Address Creation
    status, addr_res = req(f"{BASE}/me/addresses", "POST", {
        "label": "Home",
        "name": "E2E Test Customer",
        "phone": "+919999000000",
        "houseNumber": "Villa 101",
        "street": "Cyber City Blvd",
        "area": "Sector 14",
        "city": "Gurugram",
        "pincode": "122001",
        "isDefault": True
    }, token=cust_token)
    address_id = addr_res['data']['id']

    status, prods = req(f"{BASE}/products?pageSize=1")
    variant_id = prods['data'][0]['primaryVariant']['id']
    variant_name = prods['data'][0]['name']

    status, cart = req(f"{BASE}/cart/items", "POST", {"variantId": variant_id, "quantity": 4}, token=cust_token)
    assert status in [200, 201], f"Cart add failed: {cart}"
    grand = cart['data']['summary']['grandTotal'] / 100
    print(f"✅ 6. Cart & Pricing: Added 4x '{variant_name}' (Total: ₹{grand:.2f})")

    # 7. Order Placement
    order_payload = {
        "addressId": address_id,
        "paymentMethod": "COD",
        "deliveryTip": 2000,
        "deliverySlot": "Instant (10-15 mins)"
    }
    status, order_res = req(f"{BASE}/orders", "POST", order_payload, token=cust_token)
    assert status == 201, f"Order placement failed: {order_res}"
    order = order_res['data']
    order_id = order['id']
    order_num = order['orderNumber']
    print(f"✅ 7. Order Placement: Created #{order_num} (Grand Total: ₹{order['grandTotal']/100:.2f})")

    # 8. Store Fulfillment (Pick & Ready)
    status, pick_res = req(f"{BASE}/store/orders/{order_id}/pick", "POST", token=admin_token)
    assert pick_res['data']['orderStatus'] == "PREPARING"
    status, ready_res = req(f"{BASE}/store/orders/{order_id}/ready", "POST", token=admin_token)
    assert ready_res['data']['orderStatus'] == "READY_FOR_PICKUP"
    print(f"✅ 8. Store Operations: Transitioned order #{order_num} -> PREPARING -> READY_FOR_PICKUP")

    # 9. Rider Assignment & Delivery
    status, riders = req(f"{BASE}/admin/dispatch/assignments", "GET", token=admin_token)
    rider_id = riders['data'][0]['id']
    status, assign_res = req(f"{BASE}/admin/dispatch/assignments", "POST", {
        "orderId": order_id,
        "riderId": rider_id
    }, token=admin_token)
    assignment = assign_res['data']['assignment']
    assignment_id = assignment['id']
    otp = assignment['customerOtp']
    print(f"✅ 9a. Dispatch: Rider assigned. Generated Customer OTP: {otp}")

    # Rider Login & Workflow
    status, rider_login = req(f"{BASE}/auth/login", "POST", {
        "identifier": "rider@pravdhanstore.in",
        "password": "PravdhanAdmin@2026!"
    })
    rider_token = rider_login['data']['token']

    req(f"{BASE}/rider/assignments/{assignment_id}/accept", "POST", token=rider_token)
    req(f"{BASE}/rider/assignments/{assignment_id}/pickup", "POST", token=rider_token)
    status, deliver_res = req(f"{BASE}/rider/assignments/{assignment_id}/deliver", "POST", {
        "customerOtp": otp
    }, token=rider_token)
    assert deliver_res['data']['status'] == "DELIVERED"
    print(f"✅ 9b. Rider Workflow: Accepted -> Picked up -> Verified with OTP {otp} -> DELIVERED")

    # 10. Operational Reports & Analytics
    status, sales = req(f"{BASE}/admin/reports/sales?days=7", "GET", token=admin_token)
    assert status == 200, f"Sales report failed: {sales}"
    status, inv = req(f"{BASE}/admin/reports/inventory", "GET", token=admin_token)
    assert status == 200, f"Inventory report failed: {inv}"
    status, rider_rep = req(f"{BASE}/admin/reports/riders", "GET", token=admin_token)
    assert status == 200, f"Rider report failed: {rider_rep}"
    print(f"✅ 10. Analytics & Reporting: Sales GMV {sales['data']['summary']['formattedTotalRevenue']}, Inventory Valuation {inv['data']['valuation']['formattedValuation']}")

    print("=" * 70)
    print("🎉 ALL 10 E2E BACKEND MODULES VERIFIED 100% OPERATIONAL ON NEON POSTGRESQL!")
    print("=" * 70)

if __name__ == "__main__":
    run_suite()
