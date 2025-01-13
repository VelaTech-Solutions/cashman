from utils.cors_handler import handle_cors

# Test with allowed origin
print(handle_cors("https://cashflowmanager.web.app"))

# Test with additional headers
print(handle_cors("https://cashflowmanager.web.app", headers={"Custom-Header": "TestValue"}))

# Test with no additional headers
print(handle_cors("https://cashflowmanager.web.app"))
