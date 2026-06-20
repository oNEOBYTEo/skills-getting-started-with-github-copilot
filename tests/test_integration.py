def test_signup_then_unregister_updates_activity_state(client):
    signup_response = client.post("/activities/Science%20Club/signup?email=zoe%40mergington.edu")

    assert signup_response.status_code == 200

    activities_after_signup = client.get("/activities").json()
    assert "zoe@mergington.edu" in activities_after_signup["Science Club"]["participants"]

    unregister_response = client.delete("/activities/Science%20Club/signup?email=zoe%40mergington.edu")

    assert unregister_response.status_code == 200

    activities_after_unregister = client.get("/activities").json()
    assert "zoe@mergington.edu" not in activities_after_unregister["Science Club"]["participants"]