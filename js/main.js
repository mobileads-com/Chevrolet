/*
 *
 * mads - version 2.00.01
 * Copyright (c) 2015, Ninjoe
 * Dual licensed under the MIT or GPL Version 2 licenses.
 * https://en.wikipedia.org/wiki/MIT_License
 * https://www.gnu.org/licenses/old-licenses/gpl-2.0.en.html
 *
 */
var mads = function(options) {

    var _this = this;

    this.render = options.render;

    /* Body Tag */
    this.bodyTag = document.getElementsByTagName('body')[0];

    /* Head Tag */
    this.headTag = document.getElementsByTagName('head')[0];

    /* json */
    if (typeof json == 'undefined' && typeof rma != 'undefined') {
        this.json = rma.customize.json;
    } else if (typeof json != 'undefined') {
        this.json = json;
    } else {
        this.json = '';
    }

    /* fet */
    if (typeof fet == 'undefined' && typeof rma != 'undefined') {
        this.fet = typeof rma.fet == 'string' ? [rma.fet] : rma.fet;
    } else if (typeof fet != 'undefined') {
        this.fet = fet;
    } else {
        this.fet = [];
    }

    this.fetTracked = false;

    /* load json for assets */
    this.loadJs(this.json, function() {
        _this.data = json_data;

        _this.render.render();
    });

    /* Get Tracker */
    if (typeof custTracker == 'undefined' && typeof rma != 'undefined') {
        this.custTracker = rma.customize.custTracker;
    } else if (typeof custTracker != 'undefined') {
        this.custTracker = custTracker;
    } else {
        this.custTracker = [];
    }

    /* CT */
    if (typeof ct == 'undefined' && typeof rma != 'undefined') {
        this.ct = rma.ct;
    } else if (typeof ct != 'undefined') {
        this.ct = ct;
    } else {
        this.ct = [];
    }

    /* CTE */
    if (typeof cte == 'undefined' && typeof rma != 'undefined') {
        this.cte = rma.cte;
    } else if (typeof cte != 'undefined') {
        this.cte = cte;
    } else {
        this.cte = [];
    }

    /* tags */
    if (typeof tags == 'undefined' && typeof tags != 'undefined') {
        this.tags = this.tagsProcess(rma.tags);
    } else if (typeof tags != 'undefined') {
        this.tags = this.tagsProcess(tags);
    } else {
        this.tags = '';
    }

    /* Unique ID on each initialise */
    this.id = this.uniqId();

    /* Tracked tracker */
    this.tracked = [];
    /* each engagement type should be track for only once and also the first tracker only */
    this.trackedEngagementType = [];
    /* trackers which should not have engagement type */
    this.engagementTypeExlude = [];
    /* first engagement */
    this.firstEngagementTracked = false;

    /* RMA Widget - Content Area */
    this.contentTag = document.getElementById('rma-widget');

    /* URL Path */
    this.path = typeof rma != 'undefined' ? rma.customize.src : '';

    /* Solve {2} issues */
    for (var i = 0; i < this.custTracker.length; i++) {
        if (this.custTracker[i].indexOf('{2}') != -1) {
            this.custTracker[i] = this.custTracker[i].replace('{2}', '{{type}}');
        }
    }
};

/* Generate unique ID */
mads.prototype.uniqId = function() {

    return new Date().getTime();
}

mads.prototype.tagsProcess = function(tags) {

    var tagsStr = '';

    for (var obj in tags) {
        if (tags.hasOwnProperty(obj)) {
            tagsStr += '&' + obj + '=' + tags[obj];
        }
    }

    return tagsStr;
}

/* Link Opner */
mads.prototype.linkOpener = function(url) {

    if (typeof url != "undefined" && url != "") {

        if (typeof this.ct != 'undefined' && this.ct != '') {
            url = this.ct + encodeURIComponent(url);
        }

        if (typeof mraid !== 'undefined') {
            mraid.open(url);
        } else {
            window.open(url);
        }

        if (typeof this.cte != 'undefined' && this.cte != '') {
            this.imageTracker(this.cte);
        }
    }
}

/* tracker */
mads.prototype.tracker = function(tt, type, name, value) {

    /*
     * name is used to make sure that particular tracker is tracked for only once
     * there might have the same type in different location, so it will need the name to differentiate them
     */
    name = name || type;

    if (tt == 'E' && !this.fetTracked) {
        for (var i = 0; i < this.fet.length; i++) {
            var t = document.createElement('img');
            t.src = this.fet[i];

            t.style.display = 'none';
            this.bodyTag.appendChild(t);
        }
        this.fetTracked = true;
    }

    if (typeof this.custTracker != 'undefined' && this.custTracker != '' && this.tracked.indexOf(name) == -1) {
        for (var i = 0; i < this.custTracker.length; i++) {

            if (i === 1 && name !== '1st_form_submitted') continue;

            var img = document.createElement('img');

            if (typeof value == 'undefined') {
                value = '';
            }

            /* Insert Macro */
            var src = this.custTracker[i].replace('{{rmatype}}', type);
            src = src.replace('{{rmavalue}}', value);

            /* Insert TT's macro */
            if (this.trackedEngagementType.indexOf(tt) != '-1' || this.engagementTypeExlude.indexOf(tt) != '-1') {
                src = src.replace('tt={{rmatt}}', '');
            } else {
                src = src.replace('{{rmatt}}', tt);
                this.trackedEngagementType.push(tt);
            }

            /* Append ty for first tracker only */
            if (!this.firstEngagementTracked && tt == 'E') {
                src = src + '&ty=E';
                this.firstEngagementTracked = true;
            }

            /* */
            img.src = src + this.tags + '&' + this.id;

            img.style.display = 'none';
            this.bodyTag.appendChild(img);

            this.tracked.push(name);
        }
    }
};

mads.prototype.imageTracker = function(url) {
    for (var i = 0; i < url.length; i++) {
        var t = document.createElement('img');
        t.src = url[i];

        t.style.display = 'none';
        this.bodyTag.appendChild(t);
    }
}

/* Load JS File */
mads.prototype.loadJs = function(js, callback) {
    var script = document.createElement('script');
    script.src = js;

    if (typeof callback != 'undefined') {
        script.onload = callback;
    }

    this.headTag.appendChild(script);
}

/* Load CSS File */
mads.prototype.loadCss = function(href) {
    var link = document.createElement('link');
    link.href = href;
    link.setAttribute('type', 'text/css');
    link.setAttribute('rel', 'stylesheet');

    this.headTag.appendChild(link);
}

mads.prototype.extractBit = function(selector, content) {
    var e = {};
    var elems = content.querySelectorAll(selector);
    for (var elem in elems) {
        var id = elems[elem].id
        if (id) {
            Object.defineProperty(elems[elem], 'CSSText', {
                set: function(text) {
                    var pattern = /([\w-]*)\s*:\s*([^;]*)/g
                    var match, props = {}
                    while (match = pattern.exec(text)) {
                        props[match[1]] = match[2]
                        this.style[match[1]] = match[2]
                    }
                }
            })
            Object.defineProperty(elems[elem], 'ClickEvent', {
                set: function(f) {
                    this.addEventListener('click', f)
                }
            })
            elems[elem].fadeIn = function(duration) {
                duration = duration || 600
                var self = this
                self.CSSText = 'opacity:0;transition:opacity ' + (duration * 0.001) + 's;display:block;'
                setTimeout(function() {
                    self.CSSText = 'opacity:1;'
                }, 1)
            }
            elems[elem].fadeOut = function(duration) {
                duration = duration || 600
                var self = this
                self.CSSText = 'opacity:1;transition:opacity ' + (duration * 0.001) + 's;display:block;'
                setTimeout(function() {
                    self.CSSText = 'opacity:0;'
                    setTimeout(function() {
                        self.CSSText = 'display:none;'
                    }, duration)
                }, 1)
            }
            e[id] = elems[elem]
        }
    }

    return e
}

var chevrolet = function() {
    this.app = new mads({
        'render': this
    });

    document.body.style.padding = 0
    document.body.style.margin = 0

    this.app.loadCss(this.app.path + 'css/w3.css')

    this.submmitted = false;

    this.render();
    this.style();
    this.event();
}

chevrolet.prototype.render = function() {

    var content = this.app.contentTag;
    var path = this.app.path;
    content.innerHTML = '<div id="container">' +
        '<div id="first" class="w3-content" style="max-width:320px;">' +
        '<img id="f1" src="' + path + 'img/chevy-BG-Screen-01.png" class="mys w3-animate-right" style="width:100%"> \
        <div id="text-frame">\
        <img src="' + path + 'img/chevy-screen-01-copy-01.png" id="first-text"/> \
        <img src="' + path + 'img/chevy-screen-01-copy-02.png" id="second-text"/> \
        <img src="' + path + 'img/chevy-screen-01-copy-03.png" id="third-text"/> \
        </div>' +
        '</div>' +
        '<div id="second"><form id="form">' +
        '<input type="text" name="name" id="name" placeholder="NAMA" required/>' +
        '<input type="number" name="no" id="no" placeholder="NO. TELP" required/><br/>' +
        '<input type="text" name="city" id="city" placeholder="KOTA" required/><br/>' +
        '<input type="email" name="email" id="email" placeholder="EMAIL" required/><br/>' +
        '<datalist id="cities"></datalist>' +
        '<button type="submit" id="submit" style="display:none"></button>' +
        '</form></div>' +
        '<img id="fourth" src="' + path + 'img/chevy-BG-Screen-03.png">' +
        '</div>';


    this.bit = this.app.extractBit('div, img, button, form, input, datalist', content);
}

chevrolet.prototype.style = function() {
    var content = this.app.contentTag;
    var path = this.app.path;
    var bit = this.bit;

    var HW = 'width:320px;height:480px;'
    var AOpacity = 'opacity:1;transition:opacity 0.6s;'
    var ABS = 'position:absolute;left:0;top:0;'
    this.ErrField = 'border: 1px solid red;'
    this.ClearField = 'border: 1px solid #0089c3';

    console.log(bit)

    bit.container.CSSText = HW + ''
    bit.first.CSSText = [HW, ABS].join('')
    bit.second.CSSText = [HW, ABS].join('') + 'background:url(' + path + 'img/chevy-BG-Screen-02.png);display:none;'
    bit.fourth.CSSText = [HW, ABS].join('') + 'display:none;';
    bit.form.CSSText = ABS + 'text-align:center;top:130px;';
    bit.name.CSSText = 'padding:10px;width: 260px;border: 1px solid #0089c3;';
    bit.no.CSSText = 'padding:10px;width: 260px;border: 1px solid #0089c3;';
    bit.city.CSSText = 'padding:10px;width: 260px;border: 1px solid #0089c3;';
    bit.email.CSSText = 'padding:10px;width: 260px;border: 1px solid #0089c3;';
    bit['text-frame'].CSSText = 'width: 320px;height: 88px;position: absolute;top: 160px;overflow: hidden;display: none;';
    //bit['text-frame'].CSSText = 'width: 320px;height: 52px;position: relative;top: -320px;overflow: hidden;';

    setTimeout(function () {
      bit['text-frame'].CSSText = 'display: block';
    }, 300);
    setTimeout(function () {
      bit['first-text'].CSSText = 'display: none';
    }, 3300);
    setTimeout(function () {
      bit['second-text'].CSSText = 'display: none';
    }, 6300);
}

chevrolet.prototype.event = function() {
    var self = this;
    var content = this.app.contentTag;
    var bit = this.bit;

    var myIndex = 0;
    carousel();

    function carousel() {
        var i;
        var x = document.getElementsByClassName("mys");
        for (i = 0; i < x.length; i++) {
            x[i].style.display = "none";
        }
        myIndex++;
        if (myIndex > x.length) {
            myIndex = 1
        }
        x[myIndex - 1].style.display = "block";
        setTimeout(carousel, 10000);
    }

    bit.first.ClickEvent = function() {
        bit.first.fadeOut();
        bit.second.fadeIn();

        self.app.tracker('E', 'first_page');
    }

    console.log(bit)

    bit.second.addEventListener('click', function() {
        bit.submit.click();

        return false;
    })

    bit.form.addEventListener('submit', function(e) {
        e.stopPropagation();
        e.preventDefault();

        /* prevent multiple submission */
        if (self.submmitted) {
            return false;
        } else {
            self.submitted = true;
        }

        var name = bit.name.value;
        var no = bit.no.value;
        var city = bit.city.value;
        var email = bit.email.value;

        self.app.tracker('E', 'form_submit')

        if (name != '' && no != '' && city != '' && email != '' && name.trim() != '' && no.trim() != '' && city.trim() != '' && email.trim() != '') {
            //dickale@imx.co.id,karima@imx.co.id
            self.app.loadJs('https://www.mobileads.com/api/save_lf?contactEmail=dickale@imx.co.id,karima@imx.co.id&gotDatas=1& \
              element=[ \
              {%22fieldname%22:%22text_1%22,%22value%22:%22' + name + '%22}, \
              {%22fieldname%22:%22text_4%22,%22value%22:%22' + no + '%22}, \
              {%22fieldname%22:%22text_5%22,%22value%22:%22' + city + '%22}, \
              {%22fieldname%22:%22text_6%22,%22value%22:%22' + email + '%22} \
              ]&user-id=2901&studio-id=348&tab-id=1&trackid=2164&referredURL=Sample%20Ad%20Unit&callback=leadGenCallback')
        }

        return false;
    })

    bit.fourth.ClickEvent = function() {
        self.app.tracker('E', 'landing_page');
        self.app.linkOpener('https://ad.doubleclick.net/ddm/clk/321476221;150887767;m');
    }
}

chevrolet.prototype.submitCallback = function() {
    var self = this;
    var bit = this.bit;

    bit.second.fadeOut();
    bit.fourth.fadeIn();

    this.app.tracker('E', 'submitted');
}

var chev = new chevrolet()

/* leadgen callback */
function leadGenCallback(obj) {
    chev.submitCallback();
}