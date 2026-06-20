import src.app as app_module


def test_unregister_removes_student_from_activity(client):
    response = client.delete("/activities/Chess%20Club/signup?email=michael%40mergington.edu")

    assert response.status_code == 200
    assert response.json() == {"message": "Unregistered michael@mergington.edu from Chess Club"}
    assert "michael@mergington.edu" not in app_module.activities["Chess Club"]["participants"]


def test_unregister_rejects_missing_registration(client):
    response = client.delete("/activities/Chess%20Club/signup?email=not-signed-up%40mergington.edu")

    assert response.status_code == 400
    assert response.json() == {"detail": "Student is not signed up for this activity"}


def test_unregister_returns_404_for_missing_activity(client):
    response = client.delete("/activities/Robotics%20Club/signup?email=zoe%40mergington.edu")

    assert response.status_code == 404
    assert response.json() == {"detail": "Activity not found"}