/* MindCursor API client
 * All calls go to the Flask backend at /api/*
 * Token is stored in sessionStorage under 'mc_token'.
 * Admin token under 'mc_admin_token'.
 */
'use strict';

(function (global) {

  var BASE = '';   // same origin — Flask serves both HTML and /api/*

  /* ── Token storage ───────────────────────────────── */
  var api = {

    getToken: function () {
      return localStorage.getItem('mc_token') || '';
    },
    setToken: function (t) {
      if (t) localStorage.setItem('mc_token', t);
      else   localStorage.removeItem('mc_token');
    },
    getAdminToken: function () {
      return localStorage.getItem('mc_admin_token') || '';
    },
    setAdminToken: function (t) {
      if (t) localStorage.setItem('mc_admin_token', t);
      else   localStorage.removeItem('mc_admin_token');
    },

    /* ── Core fetch ──────────────────────────────── */
    _fetch: function (method, path, body, token) {
      var opts = {
        method:  method,
        headers: { 'Content-Type': 'application/json' },
      };
      if (token) opts.headers['X-Token'] = token;
      if (body)  opts.body = JSON.stringify(body);
      return fetch(BASE + path, opts).then(function (r) {
        return r.json().then(function (data) {
          if (!r.ok) return Promise.reject(data.error || 'Request failed');
          return data;
        });
      });
    },

    /* ── Auth ────────────────────────────────────── */
    signup: function (name, email, password) {
      return api._fetch('POST', '/api/auth/signup', { name: name, email: email, password: password });
    },
    signin: function (email, password) {
      return api._fetch('POST', '/api/auth/signin', { email: email, password: password });
    },
    signout: function () {
      var t = api.getToken();
      return api._fetch('POST', '/api/auth/signout', null, t).finally(function () {
        api.setToken(null);
      });
    },
    me: function () {
      return api._fetch('GET', '/api/auth/me', null, api.getToken());
    },

    /* ── Results ─────────────────────────────────── */
    postResult: function (ageGroup, score) {
      return api._fetch('POST', '/api/results', { group: ageGroup, score: score }, api.getToken());
    },
    myResults: function () {
      return api._fetch('GET', '/api/results', null, api.getToken());
    },

    /* ── Admin ───────────────────────────────────── */
    adminSignin: function (email, password) {
      return api._fetch('POST', '/api/auth/signin', { email: email, password: password });
    },
    adminStats: function () {
      return api._fetch('GET', '/api/admin/stats', null, api.getAdminToken());
    },
    adminUsers: function () {
      return api._fetch('GET', '/api/admin/users', null, api.getAdminToken());
    },
    adminUserDetail: function (id) {
      return api._fetch('GET', '/api/admin/users/' + id, null, api.getAdminToken());
    },
    adminDeleteUser: function (id) {
      return api._fetch('DELETE', '/api/admin/users/' + id, null, api.getAdminToken());
    },
    adminResults: function () {
      return api._fetch('GET', '/api/admin/results', null, api.getAdminToken());
    },
  };

  global.MindCursorAPI = api;

})(window);
