var Util = require('./Util.js');
var Model = require('./Model.js');

//view and render
var els = {
  win: $(window),
  body: $('body'),

  title: $('.main-title>header h1'),
  searchForm: $('.search-form'),
  searchInput: $('.search-form input'),
  searchBtn: $('.search-form button.search'),
  searchDropdownBtn: $('.search-form button.dropdown-toggle'),
  searchDropdownMenu: $('.search-form .dropdown-menu'),
  searchDropdownMenuTpl: $('.search-form .dropdown-menu script').html(),

  searchRelate: $('.search-relate'),
  searchRelateBd: $('.search-relate .bd'),
  searchRelateTpl: $('.search-relate script').html(),

  searchResult: $('.search-result'),
  searchResultTpl: $('.search-result script').html(),
  searchResultHd: $('.search-result .hd'),
  searchResultBd: $('.search-result .bd'),

  variableMenuTpl: $('script[template="variableMenu"]').html(),

  sourceCodeModal: $('.sourcecode-modal'),
  sourceCodeModalDropdown: $('.sourcecode-modal .dropdown-menu'),
  sourceCodeModalDropdownTpl: $('.sourcecode-modal .dropdown-menu script').html(),
  sourceCodeContent: $('.sourcecode-modal .modal-body pre code'),
  sourceCodeContentHd: $('.sourcecode-modal .modal-body .hd'),

  bookmarkBtn: $('.bookmark-btn'),
  bookmarkModal: $('.bookmark-modal'),
  bookmarkModalTagMenu: $('.bookmark-modal .modal-header .tag-menu'),
  bookmarkModalContent: $('.bookmark-modal .modal-body>.bd'),
  bookmarkModalContentHd: $('.bookmark-modal .modal-body>.hd'),
  bookmarkModalGroupTpl: $('.bookmark-modal script[data-template="repoGroup"]').html(),
  bookmarkModalGroupItemTpl: $('.bookmark-modal script[data-template="groupItem"]').html(),
  bookmarkModalTagItemTpl: $('.bookmark-modal script[data-template="tagItem"]').html(),
  bookmarkModalTagDotTpl: $('.bookmark-modal script[data-template="tagDot"]').html(),
  bookmarkModalReopTpl: $('.bookmark-modal script[data-template="repoItem"]').html(),

  bookmarkUserModal: $('.bookmark-user-modal'),
  bookmarkUserModalUserList: $('.bookmark-user-modal .user-list'),
  bookmarkUserModalUserTpl: $('.bookmark-user-modal .user-list script').html(),

  bookmarkGroupModal: $('.bookmark-group-modal'),
  bookmarkGroupModalInput: $('.bookmark-group-modal input'),

  confirmModal: $('.confirm-modal'),

  githubCorner: $('.github-corner svg'),
  donate: $('.donate'),
  donateTitle: $('.donate .title'),

  isGithub: /github/g.test(location.href),
  lastVal: ''
};

function bindEvent() {
  window.addEventListener('hashchange', onLocationHashChanged, false);
  els.searchDropdownMenu.on('click', '.all', onResetLang);
  els.searchDropdownMenu.on('change', 'input', onSelectLang);
  els.searchInput.on('keyup', function () {
    renderSearchBtn();
  });
  els.searchBtn.on('click', function () {
    onSearch();
  });
  els.searchInput.keypress(function (e) {
    if (e.which == 13) {
      onSearch();
      return false;
    }
  });
  els.searchResultBd.on('click mouseenter', '.variable-wrap', function (e) {
    e.preventDefault();
    e.stopPropagation();
    renderVariableMenu.call(this);
    return false;
  });
  els.body.on('click', '.variable-btns__code', showSourceCode);
  els.body.on('click', beforeRemoveVariableMenus);
  els.sourceCodeModal.on('hidden.bs.modal', renderSourceCode);

  //bookmark
  els.win.on('DB:ready', renderBookmarkGroup);
  els.win.on('DB:Table.RepoGroup.onchange', renderBookmarkGroup);
  els.win.on('DB:Table.RepoTag.onchange', updateBookmarkTagsData);
  els.bookmarkBtn.on('click', showBookmark);
  els.bookmarkModalTagMenu.on('click', '.dropdown-item', renderBookmarkGroupByTag);
  els.bookmarkModal.on('click', '.add-account', showBookmarkUserModal);
  els.bookmarkModal.on('click', '.add-group', function(){
    showBookmarkGroupModal();
  });
  els.bookmarkModalContentHd.on('click', '.submit', function(){
    beforeAddBookmarkUser(els.bookmarkModalContentHd);
  });
  els.bookmarkModalContentHd.keypress(function (e) {
    if (e.which == 13) {
      beforeAddBookmarkUser(els.bookmarkModalContentHd);
      return false;
    }
  });
  els.bookmarkUserModal.keypress(function (e) {
    if (e.which == 13) {
      beforeAddBookmarkUser();
      return false;
    }
  });
  els.bookmarkGroupModal.on('click', '.submit', beforeEditBookmarkGroup);
  els.bookmarkGroupModal.keypress(function (e) {
    if (e.which == 13) {
      beforeEditBookmarkGroup();
      return false;
    }
  });
  els.bookmarkModalContent.on('click', '.repo-group-item>.hd .ctrl .del', beforeDelBookmarkGroup);
  els.bookmarkModalContent.on('click', '.repo-group-item>.hd .ctrl .edit', function(){
    showBookmarkGroupModal(this.dataset.id,this.dataset.name);
  });
  els.bookmarkModalContent.on('click', '.group-menu .add-repo', beforeAddRepoToGroup);
  els.bookmarkModalContent.on('click', '.tag-menu .add-repo', beforeAddRepoToTag);
  els.bookmarkModalContent.on('click', '.repo-item .group-menu', renderBookmarkRepoGroupMenu);
  els.bookmarkModalContent.on('click', '.repo-item .tag-menu', renderBookmarkRepoTagMenu);
  els.bookmarkModalContent.on('mouseenter mouseleave ontouchstart ontouchend', '.repo-item', renderBookmarkRepoTagDots);
  els.bookmarkModalContent.on('keyup','.repo-group-item>.hd .search input',renderBookmarkSearchRepos);
  els.bookmarkModalContent.on('click','.repo-group-item>.hd .search submit',renderBookmarkSearchRepos);
  els.bookmarkUserModal.on('click', '.submit', function(){
    beforeAddBookmarkUser();
  });
  els.bookmarkUserModalUserList.on('click', '.sync', function () {
    beforeSyncUser(this.dataset.name);
  });
  els.bookmarkUserModalUserList.on('click', '.del', beforeDelUser);
  els.bookmarkGroupModal.on('hidden.bs.modal', showBookmark);
  els.bookmarkUserModal.on('hidden.bs.modal', showBookmark);

  els.confirmModal.on('click','.btn',hideConfirm);
}

function init() {
  if (Util.os.ios || Util.os.android) {
    els.isMobile = true;
    els.body.addClass('mobile');
    FastClick.attach(document.body);
  }
  bindEvent();
  renderTitle();
  renderBookmarkTip();
  renderLangMunu();
  onLocationHashChanged();
  renderAnalytics();
  //!els.isGithub && showBookmark();
}

function showSourceCode() {
  renderSourceCode();
  Model.searchcodeModel.requestSourceCode(this.dataset.id, renderSourceCode);
  this.dataset.val && renderRelatedProperty(this.dataset.val);
  els.sourceCodeModal.modal('show');
}

function showBookmark() {
  renderBookmarkTip(true);
  els.bookmarkModal.modal('show');
  renderAnalytics('bk');
}

function showConfirm(msg,callback){
  els.confirmModal.find('.modal-body').html(msg||'');
  els.confirmModalYesCallback = callback;
  els.confirmModal.show();
  setTimeout(function(){
    els.confirmModal.addClass('in');
  },50);
}
function hideConfirm(){
  els.confirmModal.removeClass('in');
  setTimeout(function(){
    els.confirmModal.hide();
  },1000);
  if($(this).hasClass('yes')){
    els.confirmModalYesCallback && els.confirmModalYesCallback();
  }
  els.confirmModalYesCallback = null;
}

function hideBookmark() {
  els.bookmarkModal.modal('hide');
}

function showBookmarkUserModal() {
  hideBookmark();
  els.bookmarkUserModal.modal('show');
}

function hideBookmarkUserModal() {
  els.bookmarkUserModal.modal('hide');
}

function showBookmarkGroupModal(id,name) {
  hideBookmark();
  els.bookmarkGroupModal.modal('show');
  if(id){
    els.bookmarkGroupModalInput.attr('data-id',id).val(name||'');
  }else{
    els.bookmarkGroupModalInput.removeAttr('data-id').val('');
  }
}

function hideBookmarkGroupModal() {
  els.bookmarkGroupModal.modal('hide');
}

function onLocationHashChanged(e) {
  e && e.preventDefault();
  var hash = Util.HashHandler.get();
  hash && onSearch(decodeURIComponent(hash).replace(/(\?.*)/, ''));
}

function onSelectLang() {
  var checked = els.searchDropdownMenu.find('input:checked'), lang = [];
  checked.each(function () {
    lang.push(this.value);
  });
  Model.searchcodeModel.setLang(lang.join(' '));
  renderSearchBtn('Search');
}

function onResetLang() {
  els.searchDropdownMenu.find('input').removeAttr('checked');
  Model.searchcodeModel.setLang();
  renderSearchBtn('Search');
}

function onSearch(val) {
  els.searchInput.blur();
  beforeRemoveVariableMenus();
  if (val && val == els.lastInputVal) {
    return;
  }
  val = val || els.searchInput.val().trim();
  els.searchInput.val(val);
  els.valHistory = els.valHistory || '';
  if (val.length) {
    var isNext = val == els.lastInputVal;
    els.lastInputVal = val;
    if (!isNext) {
      Util.HashHandler.set(encodeURIComponent(val));
      var tmpval = [], tmpch = [];

      els.lastInputVal.replace(/\s+/ig, '+').split('+').forEach(function (key) {
        if (/[^\x00-\xff]/gi.test(key)) {
          tmpch.push(key);
          els.isZHSearchKeyWords = true;
        } else {
          tmpval.push(key);
        }
      });
      els.lastVal = tmpval.join(' ');
      if (tmpch.length) {
        Model.youdaoTranslateModel.request(tmpch.join(' '), function (tdata) {
          //basic translate
          if (tdata.basic && tdata.basic.explains) {
            els.valHistory = tdata.basic.explains.join(' ');
          }
          //web translate
          if (tdata.web && tdata.web) {
            tdata.web.forEach(function (key) {
              els.valHistory += ' ' + key.value.join(' ');
            });
          }
          if (tdata && tdata.translation) {
            els.lastVal = els.lastVal + ' '
              + tdata.translation.join(' ')
                .replace(/[!$%^&*()_+|~=`{}\[\]:";'<>?,.\/]/g, '')
                .split(' ').filter(function (key, idx, inputArray) {
                  return inputArray.indexOf(key) == idx && !/^(a|an|the)$/ig.test(key);
                }).join(' ');
            beforeDoSearch();
          } else {
            beforeDoSearch();
          }
        });
      } else {
        beforeDoSearch();
      }
    } else {
      doSearch();
    }
  }
  renderTitle(true);
}

function beforeDoSearch() {
  els.lastVal = els.lastVal.trim();
  els.lastVal = els.lastVal.split(' ').filter(function (key, idx, inputArray) {
    return inputArray.indexOf(key) == idx;
  }).join(' ');
  saveKeyWordRegs();
  renderHistory();
  doSearch();
}

function saveKeyWordRegs() {
  els.valRegs = [];
  els.lastVal.replace(/\s+/ig, '+').split('+').forEach(function (key) {
    key.length && els.valRegs.push(Model.beanHelpersModel.getKeyWordReg(key));
  });
}

function doSearch() {
  if (els.lastVal && els.lastVal.length) {
    Model.searchcodeModel.request(els.lastVal, renderSearchResult);
    renderSearchResultHeader('loading');
    renderSearchBtn();
  } else {
    renderSearchResultHeader('error');
    renderSearchBtn('Search');
  }

  els.isGithub && Model.DDMSModel.postKeyWords(els.lastInputVal);
  renderAnalytics('q=' + els.lastInputVal);
}

function renderTitle(black) {
  els.title[black ? 'removeClass' : 'addClass']('animated');
}

function formatPropertyName(name) {
  name = name.toLowerCase();
  return '__codelf__' + name;
}

function storeRelatedProperty(name, res) {
  name = formatPropertyName(name);
  els.storeRelatedProperties = els.storeRelatedProperties || {};
  if (!/\//g.test(name) /*exclude links*/ && name.length < 64 /*too long*/) {
    var prop = els.storeRelatedProperties[name] = els.storeRelatedProperties[name] || {
        ids: [],
        repos: [],
        languages: []
      };
    if (!Util.isInArray(prop['ids'], res.id)) {
      prop['ids'].push(res.id);
      prop['repos'].push(res.repo);
      prop['languages'].push(res.language);
    }
  }
}

function getRelatedProperty(name) {
  name = formatPropertyName(name);
  return els.storeRelatedProperties[name];
}

function getBookmarkRopeHtm(repo, allGroupHtm, allTagHtm) {
  return els.bookmarkModalReopTpl
    .replace(/\{id\}/g, repo.id)
    .replace(/\{originRepoId\}/g, repo.originRepoId)
    .replace(/\{full_name\}/g, repo.data.full_name)
    .replace(/\{_full_name\}/g, repo.data.full_name.toLowerCase())
    .replace(/\{description\}/g, repo.data.description||'')
    .replace(/\{html_url\}/g, repo.data.html_url)
    .replace(/\{groupItems\}/g, allGroupHtm)
    .replace(/\{tagItems\}/g, allTagHtm)
}

function renderLangMunu() {
  var htm = [], storeLang = Model.searchcodeModel.getLang();
  storeLang = storeLang ? storeLang.split(' ') : [];
  Model.topProgramLan.forEach(function (key) {
    htm.push(els.searchDropdownMenuTpl
      .replace('{id}', key.id)
      .replace('{language}', key.language)
      .replace('{checked}', $.inArray(key.id, storeLang) != -1 ? 'checked' : ''));
  });
  els.searchDropdownMenu.append(htm.join(''));
}

function renderSearchResult(data) {
  var vals = [], labels = [], lineStr;
  data.results.forEach(function (rkey) {
    //filter codes
    lineStr = [];
    for (var lkey in rkey.lines) {
      var lstr = rkey.lines[lkey];
      //no base64
      if (!(/;base64,/g.test(lstr) && lstr.length > 256)) {
        lineStr.push(lstr);
      }
    }
    lineStr = lineStr.join('').replace(/\r\n/g, ' ');
    //match variables
    els.valRegs.forEach(function (key) {
      $.each(lineStr.match(key) || [], function (i, el) {
        //remove "-" and "/" from the starer and the ender
        el = el.replace(/^(\-|\/)*/, '').replace(/(\-|\/)*$/, '');
        storeRelatedProperty(el, rkey);
        if (
          !/\//g.test(el) /*exclude links*/
          && $.inArray(el, vals) === -1
          && $.inArray(el.toLowerCase(), vals) === -1
          && $.inArray(el.toUpperCase(), vals) === -1
          && el.length < 64 /*too long*/
        ) {
          vals.push(el);
          //render variable labels
          labels.push(els.searchResultTpl
            .replace('{label_type}', Model.beanHelpersModel.getRandomLabelType())
            .replace(/\{val\}/g, el)
            .replace('{id}', rkey.id)
            .replace('{repo}', rkey.repo)
          );
        }
      });
    });
  });

  if (labels.length) {
    var blockquote = els.searchResultBd.find('.blockquote');
    if (blockquote[0]) {
      els.searchResultBd.find('.blockquote').remove();
    } else {
      labels.push('<hr/>');
    }
    els.searchResultBd.prepend(labels.join(''));
    renderSearchResultHeader();
    renderTooltips();
  } else {
    renderSearchResultHeader('error');
  }
  renderTitle();
  renderDonate();
  renderBaiduShare();
}

function renderSearchBtn(str) {
  var val = els.searchInput.val().trim();
  els.searchBtn.html(str ? str : (((val.length && val == els.lastInputVal) ? 'More' : 'Search')));
}

function renderSearchResultHeader(cls) {
  els.searchResultHd.removeClass('loading error').addClass(cls || '');
}

function renderVariableMenu() {
  beforeRemoveVariableMenus();
  $(this).popover({
    trigger: 'manual',
    html: true,
    placement: 'top',
    offset: '-10 0',
    title: function () {
      return false;
    },
    content: function () {
      els.sourceCodeModal.find('.modal-header a.cur-repo').attr('href', this.dataset.repo);
      var prop = getRelatedProperty(this.dataset.val);
      return els.variableMenuTpl
        .replace('{id}', this.dataset.id)
        .replace('{count}', prop ? prop['ids'].length : 1)
        .replace(/\{val\}/g, this.dataset.val)
        .replace('{repo}', this.dataset.repo);
    },
    template: '<div class="popover popover--variable" role="tooltip">' +
    '<div class="popover-arrow"></div><div class="popover-content"></div>' +
    '</div>'
  });
  $(this).popover('show');
  els.variableClipboard = new ZeroClipboard($('.variable-btns__copy')[0]);
}

function renderTooltips() {
  els.showNextTipTimer = els.showNextTipTimer || 0;
  var now = new Date().getTime();
  if (now - els.showNextTipTimer > 1000 * 1800) {
    els.showNextTipTimer = now;
    els.searchBtn.tooltip('show');
    setTimeout(function () {
      els.searchBtn.tooltip('dispose');
    }, 3000);
  }
}
function renderBookmarkTip(dispose) {
  if(dispose){
    els.bookmarkBtn.tooltip('dispose');
  }else{
    setTimeout(function(){
      els.bookmarkBtn.tooltip('show');
      setTimeout(function(){
        els.bookmarkBtn.tooltip('hide');
      },2500);
    },500);
  }
}

function renderHistory() {
  var his = [els.lastVal, els.valHistory], labels = [], tmp = [];
  els.valHistory = his.join(' ')
    .replace(/[`~!@#$^&*()=|{}':;',\[\].<>\/?~！@#￥……&*（）——|\\{\\}【】‘；：”“’。，、？]/g, ' ')
    .replace(/\s+/ig, '+').split('+')
    .filter(function (key, idx, inputArray) {
      var checked = key.length > 1
        && inputArray.indexOf(key) == idx
        && !/[^\x00-\xff]/gi.test(key)
        && !Util.isInArray(tmp, function (ikey) {
          return new RegExp('^' + key + '$', 'ig').test(ikey)
        });
      if (checked) {
        tmp.push(key);
        labels.push(els.searchRelateTpl.replace(/\{val\}/g, key));
      }
      return checked;
    })
    .join(' ');
  if (labels.length < 1) {
    ['foo', 'bar', '2016'].forEach(function (key) {
      labels.push(els.searchRelateTpl.replace(/\{val\}/g, key));
    });
  }
  els.searchRelateBd.html('<span class="label label-default">Suggestions :</span>' + labels.join(''));
}

function renderSourceCode(data) {
  els.sourceCodeContentHd.show();
  els.sourceCodeContent.removeClass('prettyprinted').text('');
  if (data && data.code) {
    els.sourceCodeContentHd.hide();
    els.sourceCodeContent.text(data.code);
    setTimeout(function () {
      PR.prettyPrint();
    }, 100);
    renderAnalytics('vc&q=' + els.lastInputVal);
  }
}

function renderRelatedProperty(name) {
  var htm = [],
    prop = getRelatedProperty(name);
  if (prop) {
    var ids = prop['ids'],
      repos = prop['repos'],
      langs = prop['languages'],
      i = 0, len = ids.length;
    for (i; i < len; i++) {
      htm.push(
        els.sourceCodeModalDropdownTpl.replace(/\{id\}/g, ids[i])
          .replace(/\{repo\}/g, repos[i])
          .replace(/\{lang\}/g, langs[i])
          .replace(/\{label_type\}/g, Model.beanHelpersModel.getRandomLabelType())
      );
    }
  }
  els.sourceCodeModalDropdown.html(htm.join(''));
  els.sourceCodeModal.find('.match-count').html(htm.length);
}

function renderBookmarkHeader(cls){
  els.bookmarkModalContentHd.removeClass('empty loading').addClass(cls||'');
}

function renderBookmarkGroup(data) {
  if (!data || !data.repos || !data.users || !data.groups || !data.tags) {
    Model.bookmarkModel.getAll(renderBookmarkGroup);
    return;
  }
  var repos = Model.bookmarkModel.arrayToObj(data.repos,'originRepoId'),
    htm = [],
    allRepoHtm = [],
    allGroupHtm = [],
    allTagHtm = [];

  data.groups.forEach(function (key) {
    allGroupHtm.push(els.bookmarkModalGroupItemTpl
      .replace(/\{id\}/g, key.id)
      .replace(/\{name\}/g, key.name)
    );
  });
  allGroupHtm = allGroupHtm.join('');
  data.tags.forEach(function (key) {
    allTagHtm.push(els.bookmarkModalTagItemTpl
      .replace(/\{id\}/g, key.id)
      .replace(/\{name\}/g, key.name)
      .replace(/\{color\}/g, key.color)
      .replace(/\{count\}/g, key.repoIds.length)
    );
  });
  allTagHtm = allTagHtm.join('');
  data.groups.forEach(function (key) {
    var rids = /string/i.test(typeof key.repoIds)?key.repoIds.split(','):key.repoIds,
      rhtm = [];
    rids.length && rids.forEach(function (key) {
      var rd = repos[key];
      rd && rhtm.push(getBookmarkRopeHtm(rd, allGroupHtm, allTagHtm));
    });
    htm.push(els.bookmarkModalGroupTpl
      .replace(/\{id\}/g, key.id)
      .replace(/\{name\}/g, key.name)
      .replace(/\{items\}/g, rhtm.join(''))
      .replace(/\{itemCount\}/g, rhtm.length||'')
    );
  });
  if(data.repos.length){
    //add all group
    data.repos.forEach(function (key) {
      allRepoHtm.push(getBookmarkRopeHtm(key, allGroupHtm, allTagHtm));
    });
    htm.push(els.bookmarkModalGroupTpl
      .replace(/\{id\}/g, 0)
      .replace(/\{name\}/g, 'All')
      .replace(/\{items\}/g, allRepoHtm.join(''))
      .replace(/\{itemCount\}/g, data.repos.length)
    );
  }

  if(data.repos.length || data.groups.length){
    els.bookmarkModalContent.html(htm.join(''));
    renderBookmarkHeader();
  }else{
    els.bookmarkModalContent.html('');
    renderBookmarkHeader('empty');
  }
  setTimeout(function () {
    els.bookmarkModalContent.find('.repo-group-item:last-child .collapse').addClass('in');
  }, 100);

  updateBookmarkGroupsData();
  renderBookmarkTagMenu(allTagHtm);
  renderBookmarkUsers(data.users);
}

function renderBookmarkGroupByTag(){
  var id = this.dataset.id;
  Model.bookmarkModel.getAll(function(data){
    var repoObjs = Model.bookmarkModel.arrayToObj(data.repos,'originRepoId'),
      repos = [],
      repoIds;
    if(id){
      repoIds = data.tags.filter(function (key) {
        return key.id == +id;
      })[0].repoIds;
      repoIds.forEach(function (key) {
        repoObjs[key] && repos.push(repoObjs[key]);
      });
      data.repos = repos;
    }
    renderBookmarkGroup(data);
  });
}

function renderBookmarkTagMenu(htm){
  els.bookmarkModalTagMenu.find('.add-repo').remove();
  els.bookmarkModalTagMenu.append(htm);
  updateBookmarkTagsData();
}

function renderBookmarkRepoGroupMenu(){
  var el = $(this),
    id = el.parents('.repo-item').attr('data-repoid');
  els.lastBookmarkGroupsData.forEach(function(key){
    el.find('.add-repo[data-id="'+key.id+'"]')[key.repoIds.indexOf(id)==-1?'removeAttr':'attr']('data-selected',true);
  });
}

function renderBookmarkRepoTagMenu(){
  var el = $(this),
    id = el.parents('.repo-item').attr('data-repoid');
  els.lastBookmarkTagsData.forEach(function(key){
    el.find('.add-repo[data-id="'+key.id+'"]')[key.repoIds.indexOf(id)==-1?'removeAttr':'attr']('data-selected',true);
  });
}
function renderBookmarkRepoTagDots(e){
  var el = $(this),
    id = el.attr('data-repoid'),
    dotsEl = el.find('.tag-dots'),
    htm = [];
  if(/ontouchstart|mouseenter/g.test(e.type)){
    els.lastBookmarkTagsData.forEach(function(key){
      if(key.repoIds.indexOf(id)!=-1){
        htm.push(
          els.bookmarkModalTagDotTpl
            .replace(/\{color\}/g,key.color)
        );
      }
    });
    dotsEl.html(htm.join('')).addClass('in');
  }else{
    dotsEl.html('').removeClass('in');
  }
}

function renderBookmarkSearchRepos(){
  var gEl = els.bookmarkModalContent.find('.repo-group-item[data-id="0"]'),
    inputEl = gEl.find('.hd .search input'),
    countEl = gEl.find('.hd .count'),
    val = inputEl.val().trim().toLowerCase(),
    repoEls = gEl.find('.repo-list .repo-item'),
    matchRepoEls = gEl.find('.repo-list .repo-item[data-name*="'+val+'"]'),
    resultRepoEls = val.length?matchRepoEls:repoEls;

  repoEls.attr('hidden','true');
  resultRepoEls.removeAttr('hidden');
  countEl.html(resultRepoEls.length);

}
function renderBookmarkUsers(data) {
  var htm = [];
  data.forEach(function (key) {
    htm.push(els.bookmarkUserModalUserTpl
      .replace(/\{id\}/g, key.id)
      .replace(/\{name\}/g, key.name)
    )
  });
  els.bookmarkUserModalUserList.html(htm.join(''));
}

function renderDonate(isZh) {
  isZh = isZh || els.isZHSearchKeyWords;
  els.donate.removeAttr('hidden');
  els.donateTitle.removeClass('cn en').addClass(isZh ? 'cn' : 'en');
}

function renderAnalytics(param) {
  els.isGithub && setTimeout(function () {
    Util.Navigator.getFrame(null).setAttribute('src', 'http://www.mihtool.com/analytics.html?codelf' + (param ? ('&' + param) : ''));
  }, param ? 500 : 3000);
}

function renderBaiduShare() {
  if (els.hasBaiduShare || !els.isZHSearchKeyWords) {
    return;
  }
  els.hasBaiduShare = true;
  window._bd_share_config = {
    "common": {
      "bdSnsKey": {},
      "bdText": "",
      "bdMini": "2",
      "bdMiniList": false,
      "bdPic": "",
      "bdStyle": "0",
      "bdSize": "16"
    }, "slide": {"type": "slide", "bdImg": "5", "bdPos": "right", "bdTop": els.win.height() / 2 - 80}
  };
  
  with (document)0[(getElementsByTagName('head')[0] || body).appendChild(createElement('script')).src = 'http://bdimg.share.baidu.com/static/api/js/share.js?v=89860593.js?cdnversion=' + ~(-new Date() / 36e5)];
}

function beforeRemoveVariableMenus() {
  els.body.find('.popover--variable').remove();
}

function beforeAddBookmarkUser(el) {
  el = el || els.bookmarkUserModal;
  var inputEl = el.find('input'),
    val = inputEl.val().trim();
  val = val.replace(/(\/)*$/, '').replace(/^(.{0,}\/)/, '').replace(/@/g,'');
  if (val.length) {
    Model.bookmarkModel.setCurUserName(val);
    Model.bookmarkModel.UserTable.add(val, function () {
      beforeSyncUser(val);
    });
    els.isGithub && Model.DDMSModel.postBookmarkUser(val);
    renderAnalytics('bk&u=' + val);
  }
  inputEl.val('');
  hideBookmarkUserModal();
}

function beforeEditBookmarkGroup() {
  var id = els.bookmarkGroupModalInput.attr('data-id'),
    val = els.bookmarkGroupModalInput.val().trim();

  if(val.length){
    if(id){
      Model.bookmarkModel.RepoGroupTable.updateName(id,val);
      els.bookmarkGroupModalInput.removeAttr('data-id');
    }else{
      Model.bookmarkModel.RepoGroupTable.add(val);
    }
  }
  els.bookmarkGroupModalInput.val('');
  hideBookmarkGroupModal();
}

function beforeDelBookmarkGroup() {
  var el = $(this),
    id = el.attr('data-id');

  showConfirm("Remove this group?",function(){
    Model.bookmarkModel.RepoGroupTable.delete(id);
  });
}

function beforeAddRepoToGroup() {
  var el = $(this),
    targetGroupId = el.attr('data-id'),
    selected = el.attr('data-selected'),
    repoEl = el.parents('.repo-item'),
    repoId = repoEl.attr('data-repoid'),
    repoUrl = repoEl.find('.repo-item__hd a').attr('href'),
    curGroupEl = el.parents('.repo-group-item'),
    curGroupId = curGroupEl.attr('data-id'),
    curGroupElCountEl = curGroupEl.find('.hd>.count'),
    curGoupCountNum = parseInt(curGroupElCountEl.html()||0),
    targetGoupEl = curGroupEl.siblings('.repo-group-item[data-id="'+targetGroupId+'"]'),
    targetGroupName = targetGoupEl.find('>.hd>a').html(),
    targetGoupCountEl = targetGoupEl.find('.hd>.count'),
    targetGoupCountNum = parseInt(targetGoupCountEl.html()||0),
    targetGroupRepo = targetGoupEl.find('.repo-item[data-repoid="'+repoId+'"]');

  if (!selected) {
    Model.bookmarkModel.RepoGroupTable.addRopoId(targetGroupId, repoId);

    if(!targetGroupRepo.length){
      targetGoupCountEl.html(++targetGoupCountNum);
      targetGoupEl.find('.repo-list').append(repoEl.clone());
    }
    els.isGithub && Model.DDMSModel.postBookmarkGroup(repoId,repoUrl,targetGroupName);

  } else{
    Model.bookmarkModel.RepoGroupTable.removeRopoId(targetGroupId, repoId);

    if(targetGroupId==curGroupId){
      repoEl.remove();
      curGroupElCountEl.html(--curGoupCountNum||'');
    }else{
      targetGroupRepo.remove();
      targetGoupCountEl.html(--targetGoupCountNum||'');
    }
  }
}
function beforeAddRepoToTag() {
  var el = $(this),
    targetId = el.attr('data-id'),
    selected = el.attr('data-selected'),
    repoEl = el.parents('.repo-item'),
    repoId = repoEl.attr('data-repoid');

  if (targetId != undefined && targetId != 0){
    Model.bookmarkModel.RepoTagTable[selected?'removeRopoId':'addRopoId'](targetId, repoId);
  }
}

function beforeSyncUser(name) {
  if (name) {
    renderBookmarkHeader('loading');
    Model.bookmarkModel.setCurUserName(name);
    Model.bookmarkModel.syncGithub(function () {
      Model.bookmarkModel.getAll(renderBookmarkGroup);
    });
  }
}

function beforeDelUser() {
  var el = $(this),
    id = el.attr('data-id');

  showConfirm("Remove this user and all repos for the user?",function(){
    Model.bookmarkModel.UserTable.delete(id, function () {
      el.parents('.user-item').remove();
      Model.bookmarkModel.getAll(renderBookmarkGroup);
    });
  });
}

function updateBookmarkTagsData(){
  Model.bookmarkModel.RepoTagTable.getAll(function(res){
    els.lastBookmarkTagsData = res;
  });
}
function updateBookmarkGroupsData(){
  Model.bookmarkModel.RepoGroupTable.getAll(function(res){
    els.lastBookmarkGroupsData = res;
  });
}

init();
