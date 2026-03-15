from django.test import TestCase
from rest_framework.test import APIClient
from .db import users_collection, admins_collection
import bcrypt
import jwt
from django.conf import settings

SECRET_KEY = settings.SECRET_KEY

def generate_jwt_token(user_id, role):
    """Helper to generate JWT tokens for tests."""
    from datetime import datetime, timedelta
    payload = {
        "user_id": user_id,
        "role": role,
        "iat": datetime.utcnow(),
        "exp": datetime.utcnow() + timedelta(days=7)
    }
    return jwt.encode(payload, SECRET_KEY, algorithm="HS256")


class DashboardStatsTests(TestCase):
    def setUp(self):
        # clean collections before each test
        users_collection.delete_many({})
        admins_collection.delete_many({})
        self.client = APIClient()

    def test_stats_empty_collections(self):
        response = self.client.get('/api/auth/stats/')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data, {'users': 0, 'admins': 0})

    def test_stats_with_records(self):
        # insert some dummy docs
        users_collection.insert_many([
            {'userId': 'u1', 'email': 'a@a.com', 'password': b'pass'},
            {'userId': 'u2', 'email': 'b@b.com', 'password': b'pass'}
        ])
        admins_collection.insert_one({'adminId': 'a1', 'email': 'x@x.com', 'password': b'pass'})

        response = self.client.get('/api/auth/stats/')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data['users'], 2)
        self.assertEqual(response.data['admins'], 1)

    # --- new tests for unified endpoints ---
    def test_user_signup_and_login(self):
        # the userId must follow pattern 23341A0[1-5][A-Z][0-9]
        payload = {'userId': '23341A01A1', 'email': 'user@test.com', 'password': 'secret123'}
        # signup
        resp = self.client.post('/api/auth/signup/', payload, format='json')
        self.assertEqual(resp.status_code, 200)
        self.assertEqual(resp.data['role'], 'user')
        self.assertIn('token', resp.data)
        self.assertIsNotNone(resp.data['token'])

        # login
        resp2 = self.client.post('/api/auth/login/', {'userId': '23341A01A1', 'password': 'secret123'}, format='json')
        self.assertEqual(resp2.status_code, 200)
        self.assertEqual(resp2.data['role'], 'user')
        self.assertIn('token', resp2.data)
        self.assertIsNotNone(resp2.data['token'])

    def test_admin_signup_and_login(self):
        admin_id = 'ADM001'
        payload = {'userId': admin_id, 'email': 'admin@test.com', 'password': 'adminpass'}
        # signup as admin (pattern match)
        resp = self.client.post('/api/auth/signup/', payload, format='json')
        self.assertEqual(resp.status_code, 200)
        self.assertEqual(resp.data['role'], 'admin')
        self.assertIn('token', resp.data)
        self.assertIsNotNone(resp.data['token'])

        # login with same credentials
        resp2 = self.client.post('/api/auth/login/', {'userId': admin_id, 'password': 'adminpass'}, format='json')
        self.assertEqual(resp2.status_code, 200)
        self.assertEqual(resp2.data['role'], 'admin')
        self.assertIn('token', resp2.data)
        self.assertIsNotNone(resp2.data['token'])

    def test_prevent_duplicate_ids(self):
        users_collection.insert_one({'userId': '23341A01A2', 'email': 'u@u.com', 'password': b'pass'})
        resp = self.client.post('/api/auth/signup/', {'userId': '23341A01A2', 'email': 'x@x.com', 'password': 'pw'}, format='json')
        self.assertEqual(resp.status_code, 400)
        self.assertIn('ID already', resp.data['error'])

    def test_admin_list_and_delete_users(self):
        # create some users directly
        users_collection.insert_many([
            {'userId': '23341A01A3', 'email': 'a@a.com', 'password': b'pass'},
            {'userId': '23341A01A4', 'email': 'b@b.com', 'password': b'pass'}
        ])
        # create an admin for authentication
        admins_collection.insert_one({'adminId': 'ADM010', 'email': 'adm@a.com', 'password': bcrypt.hashpw(b'pw', bcrypt.gensalt())})

        # unauthorized list attempt with wrong role token
        user_token = generate_jwt_token('ADM010', 'user')
        bad = self.client.get('/api/auth/users/', HTTP_AUTHORIZATION=f'Bearer {user_token}')
        self.assertEqual(bad.status_code, 403)

        # authorized list using proper admin token
        admin_token = generate_jwt_token('ADM010', 'admin')
        good = self.client.get('/api/auth/users/', HTTP_AUTHORIZATION=f'Bearer {admin_token}')
        self.assertEqual(good.status_code, 200)
        self.assertEqual(len(good.data['users']), 2)

        # delete one user with token
        delresp = self.client.delete(
            '/api/auth/users/23341A01A3/',
            HTTP_AUTHORIZATION=f'Bearer {admin_token}',
        )
        self.assertEqual(delresp.status_code, 200)
        self.assertEqual(delresp.data['message'], 'User deleted')
        self.assertIsNone(users_collection.find_one({'userId': '23341A01A3'}))

        # try deleting nonexistent user
        notfound = self.client.delete(
            '/api/auth/users/nosuch/',
            HTTP_AUTHORIZATION=f'Bearer {admin_token}',
        )
        self.assertEqual(notfound.status_code, 404)


