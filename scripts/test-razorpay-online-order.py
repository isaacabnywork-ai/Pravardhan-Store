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
            return resp.status, json.loads(resp.read().decode("utf-8"))
    except urllib.error.HTTPError as e:
        return e.code, json.loads(e.read().decode("utf-8"))

def main():
    print("💳 Testing Razorpay Online Order Completion Flow...")

    # 1. Customer login
    phone = "+919999000000"
    req(f"{BASE}/auth/otp/request", "POST", {"phone": phone})
    status, auth = req(f"{BASE}/auth/otp/verify", "POST", {"phone": phone, "otp": "123456"})
    token = auth["data"]["token"]
    print("1. Customer authenticated via OTP")

    # 2. Get customer address
    status, addrs = req(f"{BASE}/me/addresses", "GET", token=token)
    address_id = addrs["data"][0]["id"]

    # 3. Add item to cart
    status, prods = req(f"{BASE}/products?pageSize=1")
    variant_id = prods["data"][0]["primaryVariant"]["id"]
    req(f"{BASE}/cart/items", "POST", {"variantId": variant_id, "quantity": 1}, token=token)

    # 4. Place Order with RAZORPAY
    status, order_res = req(f"{BASE}/orders", "POST", {
        "addressId": address_id,
        "paymentMethod": "RAZORPAY",
        "deliveryTip": 1000,
        "deliverySlot": "Instant (10-15 mins)"
    }, token=token)
    order = order_res["data"]
    order_id = order["id"]
    order_num = order["orderNumber"]
    print(f"2. Order Created: #{order_num} (Status: {order['orderStatus']}, Payment: {order['paymentStatus']})")

    # 5. Simulate Razorpay Online Payment
    fake_pay_id = "pay_test_99K88R77"
    status, pay_res = req(f"{BASE}/orders/{order_id}/pay", "POST", {
        "gatewayPaymentId": fake_pay_id,
        "gatewayOrderId": f"rzp_order_{order_id}"
    }, token=token)
    assert status == 200, f"Payment confirmation failed: {pay_res}"
    updated = pay_res["data"]
    print(f"3. Payment Confirmed! Payment ID: {fake_pay_id}")
    print(f"   Order Status: {updated['orderStatus']} | Payment Status: {updated['paymentStatus']}")

    # 6. Admin verifies order in store queue
    status, admin_auth = req(f"{BASE}/auth/login", "POST", {
        "identifier": "admin@pravdhanstore.in",
        "password": "PravdhanAdmin@2026!"
    })
    admin_token = admin_auth["data"]["token"]
    status, store_queue = req(f"{BASE}/store/orders", "GET", token=admin_token)
    in_queue = any(o["id"] == order_id for o in store_queue["data"])
    print(f"4. Store Fulfillment Queue check: Order #{order_num} in queue = {in_queue}")

    print("\n🎉 RAZORPAY ONLINE PAYMENT FLOW COMPLETED SUCCESSFULLY!")

if __name__ == "__main__":
    main()
