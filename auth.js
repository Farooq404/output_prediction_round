/**
 * auth.js
 * -----------------------------------------------------------------------
 * NOTE: This is a client-side-only authentication gate for a static site.
 * Hardcoded credentials ("farzi" / "farzi") are visible in source code.
 * This is NOT real security and is NOT intended for sensitive data.
 * It is meant solely to keep casual visitors out of a live quiz event.
 * -----------------------------------------------------------------------
 */

(function () {
  "use strict";

  const AUTH_KEY = "quiz-auth";
  const USERNAME_REQUIRED = "farzi";
  const PASSWORD_REQUIRED = "farzi";

  function isAuthenticated() {
    try {
      return sessionStorage.getItem(AUTH_KEY) === "true";
    } catch (e) {
      return false;
    }
  }

  function setAuthenticated(val) {
    try {
      if (val) {
        sessionStorage.setItem(AUTH_KEY, "true");
      } else {
        sessionStorage.removeItem(AUTH_KEY);
      }
    } catch (e) {}
  }

  function applyAuthState() {
    const authed = isAuthenticated();
    const loginScreen = document.getElementById("login-screen");
    const loginError = document.getElementById("login-error");

    if (authed) {
      document.documentElement.classList.remove("unauthenticated");
      if (loginScreen) loginScreen.classList.add("hidden");
    } else {
      document.documentElement.classList.add("unauthenticated");
      if (loginScreen) loginScreen.classList.remove("hidden");
      if (loginError) loginError.classList.add("hidden");
    }
  }

  document.addEventListener("DOMContentLoaded", () => {
    applyAuthState();

    const form = document.getElementById("form-login");
    const inputUsername = document.getElementById("input-username");
    const inputPassword = document.getElementById("input-password");
    const loginError = document.getElementById("login-error");

    if (!form) return;

    form.addEventListener("submit", (e) => {
      e.preventDefault();

      const userVal = (inputUsername.value || "").trim();
      const passVal = (inputPassword.value || "").trim();

      if (userVal === USERNAME_REQUIRED && passVal === PASSWORD_REQUIRED) {
        setAuthenticated(true);
        if (loginError) loginError.classList.add("hidden");
        applyAuthState();
      } else {
        if (loginError) loginError.classList.remove("hidden");
        if (inputPassword) {
          inputPassword.value = "";
          inputPassword.focus();
        }
      }
    });
  });
})();
