import src.app as app_module


def test_signup_adds_student_to_activity(client):
    response = client.post("/activities/Drama%20Club/signup?email=zoe%40mergington.edu")

    assert response.status_code == 200
    assert response.json() == {"message": "Signed up zoe@mergington.edu for Drama Club"}
    assert "zoe@mergington.edu" in app_module.activities["Drama Club"]["participants"]


def test_signup_rejects_duplicate_registration(client):
    response = client.post("/activities/Chess%20Club/signup?email=michael%40mergington.edu")

    assert response.status_code == 400
    assert response.json() == {"detail": "Student already signed up for this activity"}


def test_signup_returns_404_for_missing_activity(client):
    response = client.post("/activities/Robotics%20Club/signup?email=zoe%40mergington.edu")

    assert response.status_code == 404
    assert response.json() == {"detail": "Activity not found"}