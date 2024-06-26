/*
 * HSCore
 */
"use strict";
const HSCore = {
    init: () => {
        [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]')).map((function(e) {
            return new bootstrap.Tooltip(e)
        })), [].slice.call(document.querySelectorAll('[data-bs-toggle="popover"]')).map((function(e) {
            return new bootstrap.Popover(e)
        }))
    },
    components: {}
};
HSCore.init();
const validators = {
        "data-hs-validation-equal-field": e => {
            document.querySelector(e.getAttribute("data-hs-validation-equal-field"))
        }
    },
    HSBsValidation = {
        init(e, t) {
            var i = document.querySelectorAll(e);
            return Array.prototype.slice.call(i).forEach((e => {
                for (const t in validators) Array.prototype.slice.call(e.querySelectorAll(`[${t}]`)).forEach(validators[t]);
                e.addEventListener("submit", (i => {
                    e.checkValidity() ? this.onSubmit({
                        event: i,
                        form: e,
                        options: t
                    }) : (i.preventDefault(), i.stopPropagation()), e.classList.add("was-validated")
                }), !1)
            })), this
        },
        onSubmit: e => !(!e.options || "function" != typeof e.options.onSubmit) && e.options.onSubmit(e)
    };
HSCore.components.HSList = {
    dataAttributeName: "data-hs-list-options",
    defaults: {
        searchMenu: !1,
        searchMenuDelay: 300,
        searchMenuOutsideClose: !0,
        searchMenuInsideClose: !0,
        clearSearchInput: !0,
        keyboard: !1,
        empty: !1
    },
    collection: [],
    init: function(e, t, i) {
        const l = this;
        let n;
        n = e instanceof HTMLElement ? [e] : e instanceof Object ? e : document.querySelectorAll(e);
        for (let e = 0; e < n.length; e += 1) l.addToCollection(n[e], t, i || n[e].id);
        return !!l.collection.length && (l._init(), this)
    },
    initializeHover: function(e, t, i) {
        const l = this;
        var n = e.querySelector(`.${i.searchClass}`),
            o = !1;
        n.addEventListener("keydown", (s => {
            if (40 === s.which) s.preventDefault(), l.searchMenuShow(e, t, i), (a = i.list.querySelector(".active")) ? a.nextElementSibling && ((c = a.nextElementSibling).classList.add("active"), o.classList.remove("active"), o = c, i.list.offsetHeight < c.getBoundingClientRect().top && (i.list.scrollTop = c.getBoundingClientRect().top + i.list.scrollTop)) : (o = i.list.firstChild).classList.add("active");
            else if (38 === s.which) {
                var a, c;
                if (s.preventDefault(), a = i.list.querySelector(".active")) {
                    if (a.previousElementSibling)(c = a.previousElementSibling).classList.add("active"), o.classList.remove("active"), o = c, 0 > c.getBoundingClientRect().top && (i.list.scrollTop = c.getBoundingClientRect().top + i.list.scrollTop - i.list.offsetHeight)
                } else(o = i.list.firstChild.parentNode).classList.add("active")
            } else if (13 == s.which && n.value.length > 0) {
                s.preventDefault();
                const e = o.querySelector("a").getAttribute("href");
                e && (window.location = e)
            }
        }))
    },
    searchMenu: function(e, t, i) {
        const l = this;
        if (0 === e.querySelector(`.${i.searchClass}`).value.length || 0 === i.visibleItems.length && !t.empty) return l.helpers.fadeOut(i.list, t.searchMenuDelay), l.helpers.hide(t.empty);
        l.searchMenuShow(e, t, i)
    },
    searchMenuShow: function(e, t, i) {
        const l = this;
        if (l.helpers.fadeIn(i.list, t.searchMenuDelay), !i.visibleItems.length) {
            var n = l.helpers.show(document.querySelector(t.empty).cloneNode(!0));
            i.list.innerHTML = n.outerHTML
        }
    },
    searchMenuHide: function(e, t, i) {
        const l = this;
        var n = e.querySelector(`.${i.searchClass}`);
        t.searchMenuOutsideClose && document.addEventListener("click", (() => {
            l.helpers.fadeOut(i.list, t.searchMenuDelay), t.clearSearchInput && (n.value = "")
        })), t.searchMenuInsideClose || i.list.addEventListener("click", (e => {
            e.stopPropagation(), t.clearSearchInput && n.val("")
        }))
    },
    emptyBlock: function(e, t, i) {
        const l = this;
        if (0 === e.querySelector(`.${i.searchClass}`).value.length || 0 === i.visibleItems.length && !t.empty) l.helpers.hide(t.empty);
        else if (l.helpers.fadeIn(i.list, t.searchMenuDelay), !i.visibleItems.length) {
            var n = document.querySelector(t.empty).clone();
            l.helpers.show(n), i.list.innerHTML = n.outerHTML
        }
    },
    helpers: {
        fadeIn: (e, t) => {
            if (!e || null !== e.offsetParent) return e;
            e.style.opacity = 0, e.style.display = "block";
            var i = +new Date,
                l = function() {
                    e.style.opacity = +e.style.opacity + (new Date - i) / t, i = +new Date, +e.style.opacity < 1 && (window.requestAnimationFrame && requestAnimationFrame(l) || setTimeout(l, 16))
                };
            l()
        },
        fadeOut: (e, t) => {
            if (!e || null === e.offsetParent) return e;
            if (!t) return e.style.display = "none";
            var i = setInterval((function() {
                e.style.opacity || (e.style.opacity = 1), e.style.opacity > 0 ? e.style.opacity -= .1 : (clearInterval(i), e.style.display = "none")
            }), t / 10)
        },
        hide: e => ((e = "object" == typeof e ? e : document.querySelector(e)) && (e.style.display = "none"), e),
        show: e => ((e = "object" == typeof e ? e : document.querySelector(e)) && (e.style.display = "block"), e)
    },
    addToCollection(e, t, i) {
        const l = this;
        this.collection.push({
            $el: e,
            id: i || null,
            options: Object.assign({}, l.defaults, e.hasAttribute(l.dataAttributeName) ? JSON.parse(e.getAttribute(l.dataAttributeName)) : {}, t)
        })
    },
    _init() {
        const e = this;
        for (let t = 0; t < e.collection.length; t += 1) {
            let i, l;
            e.collection[t].hasOwnProperty("$initializedEl") || (i = e.collection[t].$el, l = e.collection[t].options, e.collection[t].$initializedEl = new List(i, l, l.values), l.searchMenu && e.helpers.hide(e.collection[t].$initializedEl.list), e.collection[t].$initializedEl.on("searchComplete", (() => {
                l.searchMenu && (e.searchMenu(i, l, e.collection[t].$initializedEl), e.searchMenuHide(i, l, e.collection[t].$initializedEl)), !l.searchMenu && l.empty && e.emptyBlock(i, l, e.collection[t].$initializedEl)
            })), l.searchMenu && l.keyboard && e.initializeHover(i, l, e.collection[t].$initializedEl))
        }
    },
    getItem(e) {
        return "number" == typeof e ? this.collection[e].$initializedEl : this.collection.find((t => t.id === e)).$initializedEl
    }
};