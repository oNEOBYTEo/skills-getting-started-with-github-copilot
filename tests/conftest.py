from copy import deepcopy

import pytest
from fastapi.testclient import TestClient

import src.app as app_module


BASELINE_ACTIVITIES = deepcopy(app_module.activities)


@pytest.fixture()
def client():
    return TestClient(app_module.app)


@pytest.fixture(autouse=True)
def restore_activities_state():
    yield

    app_module.activities.clear()
    app_module.activities.update(deepcopy(BASELINE_ACTIVITIES))