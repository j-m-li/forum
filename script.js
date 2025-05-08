// This software is dedicated to the public domain.
// Made with the help of Copilot GPT-4.1
//


// --- Render Functions for SPA ---

function renderThreads(c) {
    c.innerHTML = "<h2>" + t("threads") + "</h2><div>" + t("loading") + "</div>";
    fetch('index.php').then(function(res){return res.json();}).then(function(data){
        if (!data.ok) { c.innerHTML = '<div class="error">'+t("errorLoadingThreads")+'</div>'; return; }
        var html = '<ul>';
        for (var i=0;i<data.threads.length;++i) {
            var thread = data.threads[i];
            html += '<li><a href="#" onclick="showView(\'thread\',\''+thread.id+'\');return false;">'
                + escapeHtml(thread.title) + '</a> '+ t("by") +' ' + escapeHtml(thread.author) + '</li>';
        }
        html += '</ul>';
        c.innerHTML = "<h2>" + t("threads") + "</h2>" + html;
    });
}
function renderThread(c, threadId) {
    c.innerHTML = "<div>" + t("loading") + "</div>";
    fetch('thread.php?id='+encodeURIComponent(threadId)).then(function(res){return res.json();}).then(function(data){
        if (!data.ok) { c.innerHTML = '<div class="error">'+t("threadNotFound")+'</div>'; return; }
        var thread = data.thread, posts = data.posts;
        var user = sessionStorage.getItem('username');
        var html =  ''
            + '<h2>' + escapeHtml(thread.title) + '</h2>'
            + '<p>' + t("by") + ' ' + escapeHtml(thread.author) + '</p>'
            + '<hr>';
        for (var i=0;i<posts.length;++i) {
            var post = posts[i];
            html += '<div class="post">'
                + '<span class="meta"><b>' + escapeHtml(post.author) + '</b> @ ' + formatDate(post.created_at) + '</span><br>'
                + '<div>'
                + escapeHtml(post.content).replace(/(https:\/\/[^\s<]+)/g, function(s){return '<a href="'+s+'" target="_blank">'+s+'</a>';}).replace(/\n/g,"<br>")
                + '</div>'
                + (user && post.author === user ? ' <button onclick="deleteMyPost(\''+threadId+'\',\''+post.id+'\')">' + t("delete") + '</button>' : '')
                + '</div>';
        }
        if (user) {
            html += '<form onsubmit="postReply(event,\''+threadId+'\')">'
                + '<textarea id="replyContent" rows="3" cols="50" placeholder="' + t("postReply") + '"></textarea><br>'
                + '<button type="submit">' + t("postReply") + '</button>'
                + '</form>';
        } else {
            html += '<a href="#" onclick="showView(\'login\');return false;">' + t("login") + '</a> ' + t("postReply").toLowerCase() + '.';
        }
        html += '<hr><button onclick="showView(\'threads\')">' + t("backToThreads") + '</button>';
        c.innerHTML = html;
    });
}
function renderCreateThread(c) {
    if (!isLoggedIn()) { showView("login"); return; }
    c.innerHTML = ''
        + '<h2>' + t("createThreadH") + '</h2>'
        + '<form onsubmit="createThread(event)">'
        + t("titleLabel") + ' <input id="thread_title"><br>'
        + t("contentLabel") + '<br>'
        + '<textarea id="thread_content" rows="5" cols="50"></textarea><br>'
        + '<button type="submit">' + t("create") + '</button>'
        + '</form>'
        + '<div id="createthread_msg"></div>';
}
function renderLogin(c) {
    c.innerHTML = ''
        + '<h2>' + t("loginH") + '</h2>'
        + '<form onsubmit="login(event)">'
        + t("username") + ' <input id="login_username" autocomplete="username"><br>'
        + t("password") + ' <input type="password" id="login_password" autocomplete="current-password"><br>'
        + '<button type="submit">' + t("login") + '</button>'
        + '</form>'
        + '<div id="login_msg"></div>';
}
function renderRegister(c) {
    c.innerHTML = ''
        + '<h2>' + t("registerH") + '</h2>'
        + '<form onsubmit="register(event)">'
        + t("username") + ' <input id="register_username" autocomplete="username"><br>'
        + t("password") + ' <input type="password" id="register_password" autocomplete="new-password"><br>'
        + '<span id="captcha_question"></span>'
        + '<input id="register_captcha" placeholder="' + t("captcha") + '" style="width:4em">'
        + '<input type="hidden" id="register_captcha_id">'
        + '<br>'
        + '<button type="submit">' + t("register") + '</button>'
        + '</form>'
        + '<div id="register_msg"></div>';
    loadCaptcha();
}
function renderChangePassword(c) {
    if (!isLoggedIn()) { showView("login"); return; }
    c.innerHTML = ''
        + '<h2>' + t("changePasswordH") + '</h2>'
        + '<form onsubmit="changePassword(event)">'
        + t("currentPassword") + ' <input type="password" id="current_password"><br>'
        + t("newPassword") + ' <input type="password" id="new_password"><br>'
        + t("confirmNewPassword") + ' <input type="password" id="new_password2"><br>'
        + '<button type="submit">' + t("changePasswordBtn") + '</button>'
        + '</form>'
        + '<div id="changepw_msg"></div>';
}
function renderSearch(c) {
    c.innerHTML = ''
        + '<h2>' + t("searchPostsH") + '</h2>'
        + '<form onsubmit="searchPosts(event)">'
        + t("searchLabel") + ' <input id="search_q" placeholder="' + t("searchLabel") + '">'
        + '<button type="submit">' + t("searchBtn") + '</button>'
        + '</form>'
        + '<div id="search_results"></div>';
}
function renderUserList(c) {
    if (!isAdmin()) { c.innerHTML = "Admins only."; return; }
    c.innerHTML = "<div>" + t("loading") + "</div>";
    fetch('user_list.php', {headers: getAuthHeaders()}).then(function(res){return res.json();}).then(function(data){
        if (!data.ok) { c.innerHTML = '<div class="error">'+escapeHtml(t(data.error||"Error"))+'</div>'; return; }
        var html = '<table border="1"><tr><th>'+t("username")+'</th><th>Admin?</th></tr>';
        for (var i=0;i<data.users.length;++i) {
            var u = data.users[i];
            html += '<tr><td>'+escapeHtml(u.username)+'</td><td>'+(u.is_admin?"✅":"")+'</td></tr>';
        }
        html += "</table>";
        c.innerHTML = "<h2>" + t("userList") + "</h2>" + html;
    });
}
function renderAdminUser(c) {
    if (!isAdmin()) { c.innerHTML = "Admins only."; return; }
    c.innerHTML = "<div>" + t("loading") + "</div>";
    fetch('user_list.php', {headers: getAuthHeaders()}).then(function(res){return res.json();}).then(function(data){
        if (!data.ok) { c.innerHTML = '<div class="error">'+escapeHtml(t(data.error||"Error"))+'</div>'; return; }
        var username = sessionStorage.getItem('username');
        var html = '<table border="1"><tr><th>'+t("username")+'</th><th>Admin?</th><th>Action</th></tr>';
        for (var i=0;i<data.users.length;++i) {
            var u = data.users[i];
            if(u.username === username) {
                html += '<tr><td><b>'+escapeHtml(u.username)+'</b></td><td>'+(u.is_admin?"✅":"")+'</td><td>(you)</td></tr>';
                continue;
            }
            if (u.is_admin) {
                html += '<tr><td>'+escapeHtml(u.username)+'</td><td>✅</td><td><button onclick="modUser(\''+u.username+'\',\'demote\')">Demote</button></td></tr>';
            } else {
                html += '<tr><td>'+escapeHtml(u.username)+'</td><td></td><td><button onclick="modUser(\''+u.username+'\',\'promote\')">Promote</button></td></tr>';
            }
        }
        html += "</table>";
        c.innerHTML = "<h2>" + t("adminPromoteDemote") + "</h2>" + html;
    });
}
function renderUserDelete(c) {
    if (!isAdmin()) { c.innerHTML = "Admins only."; return; }
    c.innerHTML = "<div>" + t("loading") + "</div>";
    fetch('user_list.php', {headers: getAuthHeaders()}).then(function(res){return res.json();}).then(function(data){
        if (!data.ok) { c.innerHTML = '<div class="error">'+escapeHtml(t(data.error||"Error"))+'</div>'; return; }
        var username = sessionStorage.getItem('username');
        var html = '<table border="1"><tr><th>'+t("username")+'</th><th>Admin?</th><th>Delete</th></tr>';
        for (var i=0;i<data.users.length;++i) {
            var u = data.users[i];
            if(u.username === username) {
                html += '<tr><td><b>'+escapeHtml(u.username)+'</b></td><td>'+(u.is_admin?"✅":"")+'</td><td>(you)</td></tr>';
                continue;
            }
            html += '<tr><td>'+escapeHtml(u.username)+'</td><td>'+(u.is_admin?"✅":"")+'</td><td><button onclick="deleteUser(\''+u.username+'\')">' + t("delete") + '</button></td></tr>';
        }
        html += "</table>";
        c.innerHTML = "<h2>" + t("adminDeleteUsers") + "</h2>" + html;
    });
}
function renderModerate(c) {
    if (!isAdmin()) { c.innerHTML = "Admins only."; return; }
    c.innerHTML = "<div>" + t("loading") + "</div>";
    fetch('index.php').then(function(res){return res.json();}).then(function(data){
        if (!data.ok) { c.innerHTML = '<div class="error">'+escapeHtml(t(data.error||"Error"))+'</div>'; return; }
        var html = '<h2>' + t("adminModerate") + '</h2><ul>';
        for (var i=0;i<data.threads.length;++i) {
            var thread = data.threads[i];
            html += '<li>'
                + '<b>' + escapeHtml(thread.title) + '</b> ' + t("by") + ' ' + escapeHtml(thread.author)
                + ' <button onclick="deleteThread(\''+thread.id+'\')">' + t("deleteThread") + '</button>'
                + ' <button onclick="showModeratePosts(\''+thread.id+'\')">' + t("showModeratePosts") + '</button>'
                + '<ul id="mod-posts-' + thread.id + '" style="display:none"></ul>'
                + '</li>';
        }
        html += '</ul>';
        c.innerHTML = html;
    });
}

// --- Login and Logout Functions ---

function login(ev) {
    ev.preventDefault();
    var u = document.getElementById('login_username').value;
    var p = document.getElementById('login_password').value;
    fetch('login.php', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({username: u, password: p})
    })
    .then(function(res){return res.json();})
    .then(function(data){
        if (data.ok) {
            sessionStorage.setItem('username', data.username);
            sessionStorage.setItem('token', data.token);
            fetch('user_list.php', {headers: getAuthHeaders()})
            .then(function(adminRes){return adminRes.json();})
            .then(function(adminData){
                var isAdmin = false;
                if (adminData.ok && Array.isArray(adminData.users)) {
                    for (var i=0;i<adminData.users.length;++i) {
                        var u = adminData.users[i];
                        if (u.username === data.username && u.is_admin) { isAdmin = true; break; }
                    }
                }
                setIsAdmin(isAdmin);
                showView('threads');
            });
        } else {
            document.getElementById('login_msg').innerHTML = '<span class="error">' + escapeHtml(t(data.error)) + '</span>';
        }
    });
}

function logout() {
    fetch('logout.php', {method:'POST', headers: getAuthHeaders()})
    .then(function(){
        clearSession();
        showView('threads');
    });
}

// --- Thread, Post, and User Management Functions ---

function createThread(ev) {
    ev.preventDefault();
    var title = document.getElementById('thread_title').value;
    var content = document.getElementById('thread_content').value;
    fetch('create_thread.php', {
        method: 'POST',
        headers: Object.assign(getAuthHeaders(),{'Content-Type':'application/json'}),
        body: JSON.stringify({title:title, content:content})
    })
    .then(function(res){return res.json();})
    .then(function(data){
        if (data.ok) {
            showView('thread', data.thread_id);
        } else {
            document.getElementById('createthread_msg').innerHTML = '<span class="error">' + escapeHtml(t(data.error)) + '</span>';
        }
    });
}
function postReply(ev, threadId) {
    ev.preventDefault();
    var content = document.getElementById('replyContent').value;
    fetch('thread.php', {
        method: 'POST',
        headers: Object.assign(getAuthHeaders(),{'Content-Type':'application/json'}),
        body: JSON.stringify({thread_id: threadId, content: content})
    })
    .then(function(res){return res.json();})
    .then(function(data){
        if (data.ok) {
            showView('thread', threadId);
        } else {
            alert(t(data.error));
        }
    });
}
function deleteMyPost(threadId, postId) {
    if (!confirm(t("deletePostConfirm"))) return;
    fetch('thread.php', {
        method: 'DELETE',
        headers: Object.assign(getAuthHeaders(),{'Content-Type':'application/json'}),
        body: JSON.stringify({thread_id: threadId, post_id: postId})
    })
    .then(function(res){return res.json();})
    .then(function(data){
        if (data.ok) showView('thread', threadId);
        else alert(t(data.error));
    });
}
function modUser(username, action) {
    fetch('admin_user.php', {
        method: 'POST',
        headers: Object.assign(getAuthHeaders(),{'Content-Type':'application/json'}),
        body: JSON.stringify({username:username, action:action})
    })
    .then(function(res){return res.json();})
    .then(function(data){
        if(data.ok) renderAdminUser(document.getElementById('content'));
        else alert(t(data.error));
    });
}
function deleteUser(username) {
    if(!confirm(t("deleteUserConfirm", {username: username}))) return;
    fetch('user_delete.php', {
        method: 'POST',
        headers: Object.assign(getAuthHeaders(),{'Content-Type':'application/json'}),
        body: JSON.stringify({username:username})
    })
    .then(function(res){return res.json();})
    .then(function(data){
        if(data.ok) renderUserDelete(document.getElementById('content'));
        else alert(t(data.error));
    });
}
function searchPosts(ev) {
    ev.preventDefault();
    var q = document.getElementById('search_q').value.trim();
    if (!q) return;
    var url = 'search_posts.php?q=' + encodeURIComponent(q);
    fetch(url).then(function(res){return res.json();}).then(function(data){
        var html = '';
        if (!data.ok) {
            html = '<b style="color:red;">' + escapeHtml(t(data.error)) + '</b>';
        } else if (data.results.length === 0) {
            html = '<i>' + t("noPostsFound") + '</i>';
        } else {
            for (var i=0;i<data.results.length;++i) {
                var post = data.results[i];
                html += '<div style="border-bottom:1px solid #ccc;padding:4px;">'
                  + '<b>' + escapeHtml(post.author) + '</b> '
                  + '@ ' + formatDate(post.created_at)
                  + ' in <a href="#" onclick="showView(\'thread\',\''+escapeHtml(post.thread_id)+'\');return false;">' + t("threads") + '</a><br>'
                  + '<div style="white-space:pre-wrap;">' + highlight(escapeHtml(post.content), q) + '</div>'
                  + '</div>';
            }
        }
        document.getElementById('search_results').innerHTML = html;
    });
}
function deleteThread(threadId) {
    if (!confirm(t("deleteThreadConfirm"))) return;
    fetch('moderate.php', {
        method: 'POST',
        headers: Object.assign(getAuthHeaders(),{'Content-Type':'application/json'}),
        body: JSON.stringify({action: 'delete_thread', thread_id: threadId})
    })
    .then(function(res){return res.json();})
    .then(function(data){
        if (data.ok) renderModerate(document.getElementById('content'));
        else alert(t(data.error));
    });
}
function showModeratePosts(threadId) {
    var ul = document.getElementById('mod-posts-' + threadId);
    if (ul.style.display === "none") {
        fetch('thread.php?id='+encodeURIComponent(threadId)).then(function(res){return res.json();}).then(function(data){
            if (!data.ok) { alert(t(data.error)); return; }
            var html = '';
            for (var i=0;i<data.posts.length;++i) {
                var post = data.posts[i];
                html += '<li>'
                    + '<b>' + escapeHtml(post.author) + '</b>: ' + escapeHtml(post.content).slice(0,64)
                    + ' <button onclick="deleteModPost(\''+threadId+'\',\''+post.id+'\')">' + t("delete") + '</button>'
                    + '</li>';
            }
            ul.innerHTML = html;
            ul.style.display = "";
        });
    } else {
        ul.style.display = "none";
    }
}
function deleteModPost(threadId, postId) {
    if (!confirm(t("deletePostConfirm"))) return;
    fetch('moderate.php', {
        method: 'POST',
        headers: Object.assign(getAuthHeaders(),{'Content-Type':'application/json'}),
        body: JSON.stringify({action: 'delete_post', thread_id: threadId, post_id: postId})
    })
    .then(function(res){return res.json();})
    .then(function(data){
        if (data.ok) showModeratePosts(threadId);
        else alert(t(data.error));
    });
}
function loadCaptcha() {
    fetch('register_captcha.php?get=1')
    .then(function(res){return res.json();})
    .then(function(data){
        document.getElementById('captcha_question').textContent = t("What is ") + data.question || '...';
        document.getElementById('register_captcha_id').value = data.captcha_id || '';
        document.getElementById('register_captcha').value = '';
    });
}
function register(event) {
    event.preventDefault();
    var username = document.getElementById('register_username').value;
    var password = document.getElementById('register_password').value;
    var captcha = document.getElementById('register_captcha').value;
    var captcha_id = document.getElementById('register_captcha_id').value;
    fetch('register.php', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({username:username, password:password, captcha:captcha, captcha_id:captcha_id})
    })
    .then(function(res){return res.json();})
    .then(function(data){
        if (data.ok) {
            document.getElementById('register_msg').innerText = t("registrationSuccess");
        } else {
            document.getElementById('register_msg').innerText = t(data.error);
            loadCaptcha();
        }
    });
}
function changePassword(ev) {
    ev.preventDefault();
    var current_password = document.getElementById('current_password').value;
    var new_password = document.getElementById('new_password').value;
    var new_password2 = document.getElementById('new_password2').value;
    fetch('change_password.php', {
        method: 'POST',
        headers: Object.assign(getAuthHeaders(),{'Content-Type':'application/json'}),
        body: JSON.stringify({current_password:current_password, new_password:new_password, new_password2:new_password2})
    })
    .then(function(res){return res.json();})
    .then(function(data){
        if (data.ok) {
            document.getElementById('changepw_msg').innerHTML = '<span class="success">' + escapeHtml(data.message) + '</span>';
        } else {
            document.getElementById('changepw_msg').innerHTML = '<span class="error">' + escapeHtml(t(data.error)) + '</span>';
        }
    });
}

    // --- I18N ---
    var translations = {};
    var currentLang = sessionStorage.getItem("lang") || "en";
    if (!sessionStorage.getItem("lang")) sessionStorage.setItem("lang", "en");

    function t(key, vars) {
        var val = (translations[currentLang] && translations[currentLang][key]) || (translations["en"] && translations["en"][key]) || key;
        if (vars) {
            for (var k in vars) {
                val = val.replace("{" + k + "}", vars[k]);
            }
        }
        return val;
    }
    function setLanguage(lang) {
        currentLang = lang;
        sessionStorage.setItem("lang", lang);
        updateI18n();
        render();
    }
    function updateI18n() {
        var els = document.querySelectorAll("[data-i18n]");
        for (var i=0;i<els.length;++i) {
            var el = els[i];
            var key = el.getAttribute("data-i18n");
            el.textContent = t(key);
        }
        var langSel = document.getElementById('language-select');
        if (langSel) langSel.value = currentLang;
    }
    function loadTranslations(callback) {
        var xhr = new XMLHttpRequest();
        xhr.open('GET', 'translations.json');
        xhr.onreadystatechange = function() {
            if (xhr.readyState === 4 && xhr.status === 200) {
                try {
                    translations = JSON.parse(xhr.responseText);
                } catch (e) {
                    translations = {};
                }
                callback && callback();
            }
        };
        xhr.send();
    }

    // --- Utility ---
    function escapeHtml(text) {
        return String(text).replace(/[&<>"']/g, function(m) {
            return ({
                '&': '&amp;',
                '<': '&lt;',
                '>': '&gt;',
                '"': '&quot;',
                "'": '&#039;'
            })[m];
        });
    }
    function formatDate(ts) {
        var d = new Date(ts * 1000);
        return d.getFullYear() + "-" + (d.getMonth()+1).toString().padStart(2,'0') + "-" +
            d.getDate().toString().padStart(2,'0') + " " +
            d.getHours().toString().padStart(2,'0') + ":" +
            d.getMinutes().toString().padStart(2,'0');
    }
    function highlight(text, q) {
        if (!q) return text;
        var re = new RegExp('('+q.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&')+')', 'ig');
        return text.replace(re, '<mark>$1</mark>');
    }
    function getAuthHeaders() {
        var user = sessionStorage.getItem('username');
        var token = sessionStorage.getItem('token');
        return user && token ? {'X-Auth-User': user, 'X-Auth-Token': token} : {};
    }
    function isLoggedIn() {
        return sessionStorage.getItem('username') && sessionStorage.getItem('token');
    }
    function isAdmin() {
        return sessionStorage.getItem('is_admin') === "true";
    }
    function setIsAdmin(val) {
        sessionStorage.setItem('is_admin', val ? "true" : "");
    }
    function clearSession() {
        sessionStorage.removeItem('username');
        sessionStorage.removeItem('token');
        sessionStorage.removeItem('is_admin');
    }
    // --- Router ---
    function showView(view) {
        var hash = view;
        for (var i = 1; i < arguments.length; ++i)
            hash += ':' + arguments[i];
        window.location.hash = hash;
        render();
    }
    window.onhashchange = render;
    // --- Render Main ---
    function render() {
        updateI18n();
        var hash = window.location.hash.slice(1);
        var parts = hash.split(":");
        var view = parts[0];
        var args = parts.slice(1);
        if (!view || view === "threads") view = "threads";
        var navHtml = '';
        if (isLoggedIn()) {
            navHtml += t("welcome", {username: escapeHtml(sessionStorage.getItem('username'))}) + " "
                + '<button onclick="logout()">' + t("logout") + '</button> '
                + '<a href="#" onclick="showView(\'threads\');return false;">' + t("threads") + '</a> '
                + '<a href="#" onclick="showView(\'create_thread\');return false;">' + t("createThread") + '</a> '
                + '<a href="#" onclick="showView(\'search\');return false;">' + t("search") + '</a> '
                + '<a href="#" onclick="showView(\'change_password\');return false;">' + t("changePassword") + '</a> ';
            if (isAdmin()) {
                navHtml += ' '
                + '<a href="#" onclick="showView(\'user_list\');return false;">' + t("userList") + '</a> '
                + '<a href="#" onclick="showView(\'admin_user\');return false;">' + t("adminUsers") + '</a> '
                + '<a href="#" onclick="showView(\'user_delete\');return false;">' + t("deleteUsers") + '</a> '
                + '<a href="#" onclick="showView(\'moderate\');return false;">' + t("moderation") + '</a> ';
            }
        } else {
            navHtml += ''
                + '<a href="#" onclick="showView(\'login\');return false;">' + t("login") + '</a> '
                + '| <a href="#" onclick="showView(\'register\');return false;">' + t("register") + '</a> '
                + '| <a href="#" onclick="showView(\'threads\');return false;">' + t("threads") + '</a> ';
        }
        document.getElementById('nav').innerHTML = navHtml + "<hr>";
        var c = document.getElementById('content');
        if (view === "login") { renderLogin(c); return; }
        if (view === "register") { renderRegister(c); return; }
        if (view === "change_password") { renderChangePassword(c); return; }
        if (view === "create_thread") { renderCreateThread(c); return; }
        if (view === "thread" && args.length) { renderThread(c, args[0]); return; }
        if (view === "search") { renderSearch(c); return; }
        if (view === "user_list") { renderUserList(c); return; }
        if (view === "admin_user") { renderAdminUser(c); return; }
        if (view === "user_delete") { renderUserDelete(c); return; }
        if (view === "moderate") { renderModerate(c); return; }
        renderThreads(c);
    }
    // --- Initial ---
    loadTranslations(function() {
        if (!window.location.hash || window.location.hash === "#") {
            window.location.hash = "#threads";
        }
        updateI18n();
        render();
    });

