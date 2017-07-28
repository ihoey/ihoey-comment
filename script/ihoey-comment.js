var ihoey = ihoey || {};

var host = window.document.location.pathname,
    url = window.document.location.pathname,
    title = window.document.title,
    config = {
        authDomain: "ihoey.wilddog.com",
        syncURL: "https://ihoey.wilddogio.com"
    };
wilddog.initializeApp(config);


var auth = wilddog.auth();

ihoey.cm = ihoey.cm || {};
ihoey.tool = ihoey.tool || {};
ihoey.user = {};
var currentNode = '';

// 初始化
ihoey.cm.init = function() {
    ihoey.cm.onAuthStateChanged();
    ihoey.cm.savapageUrl();
    ihoey.cm.isLikes(url);
}

var ref = wilddog.sync().ref('/blog/');

//客户端获取IP
$.getScript('https://pv.sohu.com/cityjson?ie=utf-8', function(data, textStatus) {});

// 存储页面信息
ihoey.cm.sendPost = function() {
    ref.push({
        "title": title,
        "url": url,
        "sourceId": url,
        "ctime": new Date().getTime(),
        "vote": 0
    });
}

//是否存在
var flag = false;
// 当前页面
var currentNode = '';

//判断是否存储页面信息
ihoey.cm.savapageUrl = function() {
    ref.once('value').then(function(snapshot) {
        var data = snapshot.val()
        for (var childSnapshot in data) {
            var childData = data[childSnapshot];
            if (url == childData.url) {
                $('.ihoey-meta .like-num').text(childData.vote)
                $('.ihoey-thread').attr({ 'data-url': childData.url, 'data-title': title });
                currentNode = childSnapshot
                ihoey.cm.render();
                flag = false
                return
            } else {
                flag = true
            }
        }
        if (flag == true) {
            ihoey.cm.sendPost()
            ihoey.cm.savapageUrl()
        } else {
            currentNode = currentNode;

        }
    })
}

//点击删除
$('.ihoey-comments').on('click', '.ihoey-post .ihoey-post-dels', function() {
    var dataCid = $(this).attr('data-cid');
    ihoey.cm.delMsg(dataCid)
});

//点击喜欢
$('.ihoey-thread-liked').on('click', function() {
    ihoey.cm.likes(url)
});

//删除
ihoey.cm.delMsg = function(dataCid) {
    ref.child(currentNode).child('comments').once('value').then(function(snapshot) {
        var data = snapshot.val()
        console.log(data)
        for (var childSnapshot in data) {
            var childData = data[childSnapshot];
            if (dataCid == childData.cid) {
                ref.child(currentNode).child('comments').child(childSnapshot).remove()
                    .then(function() {
                        console.info('remove node success.')
                        ihoey.cm.render()
                    })
                    .catch(function(err) {
                        console.info('remove node failed', err.code, err);
                    });
                return
            }
        }
    })
}
//存储消息
ihoey.cm.sendMsg = function(content) {
    ref.child(currentNode).child('comments').push({
        "cid": (Math.random() * Date.now()).toFixed(0),
        "ctime": new Date().getTime(),
        "content": content,
        "pid": "0",
        "ip": returnCitySN.cip,
        "port": 0,
        "sc": "",
        "vote": 0,
        "against": 0,
        "anonymous": ihoey.user.isAnonymous,
        "user": {
            "userId": ihoey.user.uid,
            "nickname": ihoey.user.displayName || '梦魇小栈',
            "avatar": ihoey.user.photoURL.replace('http','https') || 'https://sponsor.ihoey.com/images/like.svg',
            "anonymous": ihoey.user.isAnonymous || false,
            "url": ihoey.user.url || 'https://blog.ihoey.com'
        }
    });
}

//判断登录
ihoey.cm.onAuthStateChanged = function(user) {
    auth.onAuthStateChanged(function(user) {
        ihoey.user = user
        console.log(user, 2)
        if (user != null) {
            $('.logup').hide();
            if (user.providerId != 'anonymous') {
                $('.ihoey-visitor-name').text(user.displayName).attr('data-uid',user.uid);
                $('.ihoey-avatar img').attr('src', user.photoURL);
            } else {
                $('.ihoey-visitor-name').text('匿名用户').attr('data-uid',user.uid);
                $('.ihoey-avatar img').attr('src', 'https://sponsor.ihoey.com/images/like.svg');
            };
            $('.logout').show();
            $('.ihoey-visitor-name').show();
            //退出
            $('.logout').click(function() {
                auth.signOut().then(function() {
                    // 退出成功
                    window.location.reload()
                }).catch(function(error) {
                    // 发生错误
                    console.log("sign-out-error")
                })
            })
        } else {
            $('.logout').hide();
            // 直接使用 signInWithRedirect 会造成重复登录。
            // QQ登录
            $('.qq').click(function() {
                var provider = new wilddog.auth.QQAuthProvider();
                auth.signInWithRedirect(provider).then(function(user) {
                    console.log(user);
                    console.log('登录了')
                }).catch(function(error) {
                    // 错误处理
                    console.log(error);
                    // ...
                })
            });
            $('.wb').click(function() {
                var provider = new wilddog.auth.WeiboAuthProvider();
                auth.signInWithRedirect(provider).then(function(user) {
                    console.log(user);
                    console.log('登录了')
                }).catch(function(error) {
                    // 错误处理
                    console.log(error);
                    // ...
                })
            });
            //匿名登录
            $('.nm').click(function() {
                wilddog.auth().signInAnonymously().then(function(user) {
                    console.log(user);
                }).catch(function(error) {
                    // 错误处理
                    console.log(error);
                    // ...
                })
            })
        }
    })
}

//发布
$('.ihoey-post-button').click(function() {
    if ($('.ihoey-textarea-wrapper textarea').val() != '') {
        var ex = $('.ex li').clone();
        var content = $('textarea').val();
        $('textarea').val('');
        var photoURL = $('.ihoey-replybox .ihoey-avatar img').attr('src');
        var nickName = $('.ihoey-visitor-name').text();
        ihoey.cm.sendMsg(content);
        ihoey.cm.render()
    } else {
        alert('你还没有输入内容！')
    }
});

//渲染
ihoey.cm.render = function() {
    ref.child(currentNode).child('comments').once('value', function(snapshot) {
        var info = snapshot.val();
        if (info !== null) {
            $('.ihoey-comments .ihoey-post').remove()
            for (ele in info) {
                var ex = $('.ex li').clone();
                ex.find('.ihoey-avatar img').attr('src', info[ele].user.avatar).attr('alt', info[ele].user.nickname);
                ex.find('.ihoey-user-name').text(info[ele].user.nickname).attr('href', info[ele].user.url || 'https://www.ihoey.com');
                ex.find('.ihoey-time').text(new Date(info[ele].ctime).format("yyyy年MM月dd日")).attr('title', new Date(info[ele].ctime).format("yyyy年MM月dd日 HH:mm:ss"));
                ex.find('.ihoey-comment-body .text').text(info[ele].content);
                if (info[ele].user.userId == $('.ihoey-visitor-name').attr('data-uid')) {
                    ex.find('.ihoey-post-dels').attr('data-cid', info[ele].cid).show();
                }else{
                    ex.find('.ihoey-post-dels').hide();
                }
                ex.show()
                $('.ihoey-comments-content').after(ex);
            }
        } else {
            $('.ihoey-comments .ihoey-post').remove()
        }

    });
}

//格式化时间
Date.prototype.format = function(fmt) {
    var o = {
        "M+": this.getMonth() + 1,
        //月份
        "d+": this.getDate(),
        //日
        "h+": this.getHours() % 12 == 0 ? 12 : this.getHours() % 12,
        //小时
        "H+": this.getHours(),
        //小时
        "m+": this.getMinutes(),
        //分
        "s+": this.getSeconds(),
        //秒
        "q+": Math.floor((this.getMonth() + 3) / 3),
        //季度
        "S": this.getMilliseconds() //毫秒
    };
    var week = {
        "0": "\u65e5",
        "1": "\u4e00",
        "2": "\u4e8c",
        "3": "\u4e09",
        "4": "\u56db",
        "5": "\u4e94",
        "6": "\u516d"
    };
    if (/(y+)/.test(fmt)) {
        fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
    }
    if (/(E+)/.test(fmt)) {
        fmt = fmt.replace(RegExp.$1, ((RegExp.$1.length > 1) ? (RegExp.$1.length > 2 ? "\u661f\u671f" : "\u5468") : "") + week[this.getDay() + ""]);
    }
    for (var k in o) {
        if (new RegExp("(" + k + ")").test(fmt)) {
            fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
        }
    }
    return fmt;
}

//工具
ihoey.tool.palindrome = function(str) {
    var newStr = str.toLowerCase().replace(/[^A-Za-z0-9]/g, "");
    return newStr;
}

//设置cookie
ihoey.tool.setCookie = function(key, value) {
    document.cookie = key + "=" + escape(value);
}

//获取cookie的值
ihoey.tool.getCookie = function(key) {
    if (document.cookie.length) {
        var cookies = ' ' + document.cookie;
        var start = cookies.indexOf(' ' + key + '=');
        if (start == -1) { return null; }
        var end = cookies.indexOf(";", start);
        if (end == -1) { end = cookies.length; }
        end -= start;
        var cookie = cookies.substr(start, end);
        return unescape(cookie.substr(cookie.indexOf('=') + 1, cookie.length - cookie.indexOf('=') + 1));
    } else { return null; }
}

//根据点击传进来的id
ihoey.cm.likes = function(id) {
    if (ihoey.tool.getCookie(id) == null) {
        ihoey.tool.setCookie(id, id);
    } else {
        if (ihoey.tool.getCookie(id) == id) {
            $('.ihoey-thread-liked .ihoey-thread-like-text').text('已喜欢')
            return;
        }
    }
    //这里是你自己的逻辑 通过ajax保存到数据库的数值
    ref.child(currentNode).child('vote').once('value').then(function(snapshot) {
        ref.child(currentNode).child('vote').set(Number(snapshot.val()) + 1)
        $('.ihoey-meta .like-num').text(Number(snapshot.val()) + 1)
    })
}

//根据点击传进来的id
ihoey.cm.isLikes = function(id) {
    if (ihoey.tool.getCookie(id) == null) {
        $('.ihoey-thread-liked .ihoey-thread-like-text').text('喜欢')
    } else {
        if (ihoey.tool.getCookie(id) == id) {
            $('.ihoey-thread-liked .ihoey-thread-like-text').text('已喜欢')
        }
    }
}
