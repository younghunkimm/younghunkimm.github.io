(function(){
    var Search = this.Search = function(){}

    var MAX_SEARCH_WORD_LENGTH = 200,
         MAX_SEARCH_WORD_BYTE = 400,
         MAX_SEARCH_WORD_CONDITION = 1000,
          MAX_PAYMENT_PRICE = 999999999,
          MAX_PRODUCT_COUNT = 999999999

    function setCookie(name,value,days) {
        if (days) {
            var date = new Date();
            date.setTime(date.getTime()+(days*24*60*60*1000));
            var expires = "; expires="+date.toGMTString();
        }
        else var expires = "";
        document.cookie = name+"="+value+expires+"; path=/";
    }

    function getCookie(name) {
        var nameEQ = name + "=";
        var ca = document.cookie.split(';');
        for (var i=0;i < ca.length;i++) {
            var c = ca[i];
            while (c.charAt(0)==' ') c = c.substring(1,c.length);
            if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length,c.length);
        }
        return null;
    }

    function removeCookie(name) {
        setCookie(name,"",-1);
    }

    function checkEventKeyCode (submit,e)
    {
        if (e.keyCode == 13) {
            e.preventDefault();
            $("input[name='realclick']").val('T');
            if (SHOP.isMobileAdmin() === true) {
                EC_MOBILE_ADMIN_ORDERS_SEARCH.setSubmit();
            } else {
                submit();
            }
       }
    }

    // 윤달 체크용 구글링
    function checkValidDate( year ){

        var ifor = parseInt( year ) % 4 ;
        var iten = parseInt( year ) % 100;
        var iforhund = parseInt( year ) % 400;
        if ( (ifor == 0 ) && !( iten != 0) || ( iforhund == 0 )  ) { return true; }
        else { return false; }

    }

    // 월 - 체크용
    function checkValidMonth(iYear, iMonth , iMinMonth ){

        var aReturn = [];
        var iTemp = parseFloat( iMonth ) + parseFloat(iMinMonth);

        if (iTemp ==  0) { aReturn.push({ 'year' : iYear-1, 'month' : 12 }); }
        else if ( iTemp < 0 ) { aReturn.push({ 'year' : iYear-1, 'month' : 12 + iTemp }); }
        else { aReturn.push({ 'year' : iYear, 'month' : iTemp }); }

        return aReturn;
    }

    this.Search.setCookie = setCookie;
    this.Search.getCookie = getCookie;

    Search.load = function () {
        this.multiSelect.init();
        this.methodSearch.init();
        this.shopSearch.init();
        this.mainSearch.init();
        this.dateSearch.init();
        this.productSearch.init();
        this.depositStatus.init();
        this.memberType.init();
        this.payTerms.init();
        this.itemCount.init();
        this.submit.init();
        this.detailView.init();
        this.orderState.init();
        this.orderStatusCancel.init();
        this.refundType.init();
        this.detailSearchLayer.init();
        this.discountMethod.init();
        this.mainSearch.setLabelSearch(); // submit.init()보다 후에 호출되어야함.
    }

    Search.redioChecked = {
        init : function()
        {

        }
    }

    Search.multiSelect = {
        init : function()
        {
            /* 셀렉 박스 CSS*/
            $('.mNewDropSelect .value .eDropSelect').click(function () {
                let _height = parseInt($(this).css('height')) + 2;
                $('.mNewDropSelect .result').css('top', _height);

                var _status = $(this).parent().parent().hasClass('selected');
                $('.mNewDropSelect').removeClass('selected');
                _status ? $(this).parent().parent().addClass('selected') : $(this).parent().parent().removeClass('selected');

                selectToggle($(this).parent().parent());
            });
            $('.mNewDropSelect .list .eDropSelect').click(function () {
                selectToggle($(this).parent());
            });

            function selectToggle(parent) {
                let _parent = parent;
                _parent.hasClass('selected') ? _parent.removeClass('selected') : _parent.addClass('selected');
            }

            /* 다른영역 클릭시 멀티셀렉박스 접히도록*/
            document.body.addEventListener('mousedown', (e) => {
                let oClickTarget = e.target;
                let bExistOpenNewDropSelect = $(document).find('.mNewDropSelect.selected').length > 0;

                if (bExistOpenNewDropSelect) {
                    let bClickInOpenMultiSelectBox = $(oClickTarget).parents('.mNewDropSelect').hasClass('selected');
                    if (!bClickInOpenMultiSelectBox) {
                        $(document).find('.mNewDropSelect.selected').each((idx, oMultiSelect) => {
                            $(oMultiSelect).removeClass('selected');
                        })
                    }
                }

            });

            // 멀티셀렉박스 css 및 event
            Search.multiSelect.setMultiSelectEvent();
            // 체크안된 중간 depth 체크
            Search.multiSelect.setCheckedUpperCheckbox();
            // MultiSelect 박스 선택값 세팅
            Search.multiSelect.setSelectedValueString();
        },
        setMultiSelectEvent : function(oTargetNewDropSelect = null)
        {

            /* 전체 체크박스 js */
            let oTargetCheckbox = null;
            if (oTargetNewDropSelect !== null) {
                oTargetCheckbox = $(oTargetNewDropSelect).find('.gLabel');
            } else { // 초기로딩
                oTargetCheckbox = $('.mNewDropSelect .result .list .gLabel');
            }
            $(oTargetCheckbox).change(function(e) {
                const oMyCheckbox = $(this).children('.fChk');
                const bChecked = $(oMyCheckbox).attr('checked');

                // 전체 누른경우
                if ($(this).parent().hasClass('all')) { // 전체 아니면 선택안함.
                    let aAllListWrapUl = $(this).parent().parent(); // this -> label / parent -> li / parent -> ul
                    Search.multiSelect.changeAllChildrenCheckbox(aAllListWrapUl, bChecked);
                } else { // 전체 외의 체크박스
                    const aMyUnderLi = $(this).siblings('ul');
                    if (aMyUnderLi.length > 0) { // 하위 체크박스들
                        Search.multiSelect.changeAllChildrenCheckbox(aMyUnderLi, bChecked);
                    }

                    // 부모 확인
                    if (!bChecked) {
                        // 내가 false 라면 부모들도 false
                        Search.multiSelect.changeParentCheckbox(oMyCheckbox, false);
                    } else {
                        // 내가 true 라면 형제 확인하여 부모에 반영, 부모도 형제 확인하여 조부모 checkbox에 반영
                        Search.multiSelect.checkSiblingsAndChangeParent(oMyCheckbox);
                    }
                }
                Search.multiSelect.setSelectedValueString(oMyCheckbox.parents('.mNewDropSelect'));
            });

        },
        setSelectedValueString : function(oElement)
        {
            if (typeof oElement === 'undefined') {
                oElement = $("#QA_deposit1").find('div .mNewDropSelect');
            }

            var sValueString = '';
            $.each(oElement, (index, oMultiDrop) => {
                    // 중분류명으로 표시하는 애들
                    const bDisplayMid = $(oMultiDrop).hasClass('displayMidCategoryName');
                    const oAllCheck = $(oMultiDrop).find('li.all .fChk');
                    if (oAllCheck.attr('checked')) {
                        sValueString = __('ALL', 'ORDERS.SEARCH');
                    } else {

                        let aSelectedValue = Search.multiSelect.findBottomCheckbox($(oMultiDrop).find('ul.list'), bDisplayMid);

                        if (aSelectedValue.length > 0) {
                            sValueString = aSelectedValue.join(',');
                        } else {
                            sValueString = __('DO.NOT.SELECT', 'ORDERS.SEARCH');
                        }
                    }
                    if (sValueString == "") {
                        $(oMultiDrop).children('.value').children('p').html("&nbsp");
                    } else {
                        $(oMultiDrop).children('.value').children('p').text(sValueString);
                    }


                    // 선택된 옵션 나열 input box 높이 변화에 따른 분리 방지
                    let _height = parseInt($(oMultiDrop).find('.value').css('height')) + 2;
                    $(oMultiDrop).find('.result').css('top', _height);
            })
        },
        findBottomCheckbox : function (oUlElement, bDisplayMid)
        {
            let aSelectedValue = [];

            let writeAlready = false; // 중분류 표시해야 하는 경우, 소분류 loop 일때를 위한 flag
            $(oUlElement).children('li').each((idx, oLi) => {
                const oChildUl = $(oLi).children('ul');

                if (oChildUl.length < 1) {
                    if ($(oLi).hasClass('all')) {
                        return;
                    }
                    let oCheckbox = $(oLi).children('label').children('input:checkbox');
                    if ($(oCheckbox).attr('checked')) {
                        if (bDisplayMid) { // 환불수단,유입경로
                            if ($(oUlElement).hasClass('list')) { // 중분류밖에 없는 경우
                                aSelectedValue.push($(oCheckbox).parent().text().trim());
                            } else { // 소분류까지 내려온 경우
                                if (!writeAlready) {
                                    aSelectedValue.push($(oUlElement).siblings('label').text().trim());
                                    writeAlready = true;
                                }
                            }
                            return true;
                        } else {
                            if ($(oCheckbox).parent().find('div.onlyText').length > 0) { // 회원구분 > 비회원 > 블랙리스트 (도움말 때문에)
                                aSelectedValue.push($(oCheckbox).parent().find('div.onlyText').text().trim())
                            } else {
                                aSelectedValue.push($(oCheckbox).parent().text().trim());
                            }
                        }
                    }
                } else {
                    // 한번더 depth 가 있는 경우
                    aSelectedValue = aSelectedValue.concat(Search.multiSelect.findBottomCheckbox(oChildUl, bDisplayMid));
                }
            });

            return aSelectedValue;
        },
        changeAllChildrenCheckbox : function (oElement, bChecked)
        {
            const aUnderCheckboxes = $(oElement).find('input:checkbox');
            $.each(aUnderCheckboxes, (iIdx1, oCheckbox) => {
                if ($(oCheckbox).attr('checked') !== bChecked) {
                    $(oCheckbox).attr('checked', bChecked);
                }
            })
        },
        /**
         * 3가지 케이스
         * parent.parent 가 li.all 인 경우. ( 전체가 클릭된 경우)
         * parent.parent.parent 가 ul list 이고, 자식중 .all 을 찾아야 하는 경우(2depth)
         * parent.parent.parent 가 ul 이고, 동료가 label 인 경우 (3depth)
         *
         * @param oStandardCheckbox
         * @param bChecked
         * @returns void|object
         */
        changeParentCheckbox : function (oStandardCheckbox, bChecked)
        {
            // 1 번 케이스 : 본인이 "전체" : parent.parent 가 li.all
            const oParentLi = $(oStandardCheckbox).parent().parent('li');
            if (oParentLi.length < 1) return;
            if ($(oParentLi).hasClass('all')) return; // 더이상 상위 checkbox 없음.


            let oParentCheckbox;

            const oParentUl = $(oParentLi).parent();
            if (oParentUl.hasClass('list')) { // 2번 케이스 : parent.parent.parent 가 ul list 여서 형제중 li.all (전체) 를 찾아 바꾸는 경우
                oParentCheckbox = oParentUl.children('li.all').find('input:checkbox');
            } else { // 3번 케이스 : parent.parent.parent 가 ul 이고, 동료가 label 인 경우
                oParentCheckbox = oParentUl.siblings('label').children('.fChk');
            }

            if (typeof oParentCheckbox !== 'object') { // 더이상 상위 checkbox 없음
                return;
            }

            if ($(oParentCheckbox).attr('checked') !== bChecked) {
                $(oParentCheckbox).attr('checked', bChecked);
            }

            if (!bChecked) { // false 인 경우는 형제 확인 필요없이 부모도 false 로 변경
                oParentCheckbox = Search.multiSelect.changeParentCheckbox(oParentCheckbox, false);
            }
            return oParentCheckbox;
        },
        checkSiblingsAndChangeParent : function(oStandardCheckbox)
        {
            const aSiblingsLi = $(oStandardCheckbox).parent().parent().siblings('li');

            if (aSiblingsLi.length < 0) return;

            var bAllTrue = true;

            $.each(aSiblingsLi, (index, oLi) => {
                // 형제중 "전체" 인 경우는 skip
                if ($(oLi).hasClass('all')) return true;

                // 형제들의 checked 확인
                if ($(oLi).children('label').children('input').attr('checked') === false) {
                    bAllTrue = false;
                    return false;
                }
            });

            if (!bAllTrue) return;


            // 형제가 모두 true 면 부모에 반영
            const oParentCheckbox = Search.multiSelect.changeParentCheckbox(oStandardCheckbox, true);

            if (oParentCheckbox) {
                if (typeof oParentCheckbox === 'object') {
                    Search.multiSelect.checkSiblingsAndChangeParent(oParentCheckbox);
                }
            }
        },
        setCheckedUpperCheckbox : function(oElement)
        {
            if (typeof oElement === 'undefined') {
                oElement = $("#QA_deposit1").find('div .mNewDropSelect');
            }

            $.each(oElement, (index, oMultiDrop) => {
                let bAllCheckboxChecked = true;
                let oAllCheckboxElement = null;
                const oUlElement = $(oMultiDrop).find('ul.list');
                $(oUlElement).children('li').each((idx, oLi) => {
                    const oChildUl = $(oLi).children('ul');
                    if ($(oLi).hasClass('all') && oChildUl.length === 0) { // 대분류 상위 '전체'
                        oAllCheckboxElement = $(oLi).children('label').children('input:checkbox');
                        return;
                    }

                    const oMidDepthCheckbox = $(oLi).children('label').children('input:checkbox'); // 중분류 상위

                    if ($(oMidDepthCheckbox).attr('checked')) return true;

                    if (oChildUl.length > 0) {
                        var bAllChecked = true;
                        $(oChildUl).children('li').each((idx2, oLi2) => {
                            if ($(oLi2).find('input:checkbox').attr('checked') === false) {
                                bAllChecked = false;
                                return false;
                            }
                        });
                        if (bAllChecked) {
                            $(oLi).children('label').children('input:checkbox').attr('checked', true);
                        }
                    }

                    if (bAllCheckboxChecked && !bAllChecked) {
                        bAllCheckboxChecked = false;
                    }
                });

                // console.log($(oMultiDrop).parent().prev().html(), bAllCheckboxChecked);

                $(oUlElement).children('li.all').children('label').children('input:checkbox').attr('checked', bAllCheckboxChecked);

            });
        }
    }

    Search.methodSearch = {
        init : function ()
        {
            this.setSearchTypeInit();
            this.setSearchTypeRadio();
        },
        setSearchTypeInit : function ()
        {
            var oSearchStatusTypeUl = $("#searchStatusType");
            if ( oSearchStatusTypeUl.length > 0) {
                var sSearchType = getCookie("searchStatusType");
                if (sSearchType == "method") {
                    oSearchStatusTypeUl.find("input:radio[name='searchStatusType']").each(function (){
                        if (this.value== "method") {
                            $(this).attr("checked",true);
                        }
                    });
                    $("#caseSearch").hide();
                    $("#statusSearch").show();
                } else {
                    oSearchStatusTypeUl.find("input:radio[name='searchStatusType']").each(function (){
                        if (this.value== "case") {
                            $(this).attr("checked",true);
                        }
                    });
                    $("#caseSearch").show();
                    $("#statusSearch").hide();
                }
            }


        },
        setSearchTypeRadio : function ()
        {
            var oSearchStatusTypeUl = $("#searchStatusType");
            if ( oSearchStatusTypeUl.length > 0) {
                $(":radio[name='searchStatusType']").click(function(){
                    if (this.value == "method") {
                        $("#caseSearch").hide();
                        $("#statusSearch").show();
                        setCookie("searchStatusType","method",15);
                    } else {
                        $("#caseSearch").show();
                        $("#statusSearch").hide();
                        setCookie("searchStatusType","case",15);
                    }
                });
            }
        }
    }

    /**
     * 쇼핑몰 검색 영역 이벤트 정의
     * @author jwlee04
     * @since 2013.09.25
     */
    Search.shopSearch = {

        iCurrentShopNo : null,
        oShipInfo : {},
        oHopeShipInfo : {},
        oSecondShipInfo : {},
        oMemberGradeInfo : {},
        oDepositBankInfo : {},

        init : function () {
            this.setChangeShopEvent();
        },

        // 쇼핑몰 선택시 입금은행, 회원등급, 배송업체 정보 갱신 이벤트 정의
        setChangeShopEvent : function () {

            var oMemberGradeSelectBox = $("input[name='group_no[]']");
            var oShipCompanySelectBox = $("input[name='ShipCompanyId[]']");
            var oHopeShipCompanySelectBox = $("#hopeShippingCompanyByShop");
            var oRefundBankInfoSelectBox = $("select[name='bank_info']"); // 환불관리
            var oBankInfoInputBox = $("input[name='bank_info[]']"); // 입금전관리
            $("select[name='shop_no_order']").change(function() {
                Search.shopSearch.iCurrentShopNo = $("select[name='shop_no_order']").val();

                if (oMemberGradeSelectBox.length > 0) {
                    Search.shopSearch.setShopMemberGrade();
                }
                if (oShipCompanySelectBox.length > 0) {
                    Search.shopSearch.setShopShipCompany();
                }
                if (oHopeShipCompanySelectBox.length > 0) {
                    Search.shopSearch.setShopHopeShipCompanyId();
                }
                if (oRefundBankInfoSelectBox.length > 0) {
                    Search.shopSearch.setRefundBankInfo();
                }
                if (oBankInfoInputBox.length > 0) {
                    Search.shopSearch.setBankInfo();
                }


            });

            $("#checkedShopNoOrder :checkbox[value=all]").bind("click",function(){
                $("#checkedShopNoOrder input").not("[value=all]").attr("checked",this.checked);
                if (this.checked == true) {
                    $("#checkedShopNoOrder label").addClass("eSelected");
                } else {
                    $("#checkedShopNoOrder label").removeClass("eSelected");
                }
            });

            if($("#checkedShopNoOrder :checkbox[value=all]").attr("checked")) {
                $("#checkedShopNoOrder :checkbox[value=all]").triggerHandler("click");
            }

            $("#checkedShopNoOrder :checkbox").not("[value=all]").bind("click",function(){

                var oSelect = $("#checkedShopNoOrder :checkbox").not(":checked,[value=all]");

                var isChecked = false;
                if(oSelect.length > 0) {
                    $("#checkedShopNoOrder :checkbox[value=all]").parent().removeClass("eSelected");
                } else {
                    $("#checkedShopNoOrder :checkbox[value=all]").parent().addClass("eSelected");
                    isChecked = true;
                }

                $("#checkedShopNoOrder :checkbox[value=all]").attr("checked", isChecked);
            });

        },

        setShopHopeShipCompanyId : function () {

            if ( !Search.shopSearch.oHopeShipInfo[this.iCurrentShopNo] ) {
                var sParam = 'getMode=hopeShippingCompany&shop_no=' + this.iCurrentShopNo;
                var sUrl = getMultiShopUrl('/admin/php/s_new/order_get_json.php');

                $.ajax({
                    type : 'post',
                    url : sUrl,
                    data : sParam,
                    success : function(r) {
                        var oTmp = $.parseJSON(r);
                        var oTitle = { 'value' : 'all', 'name' : __('ALL', 'ADMIN.JS.ORDERS.ORDER.SEARCH')};
                        var oData = [];
                        for ( var val in oTmp ) {
                            oData.push({ 'value' : oTmp[val].sc_id, 'name' : oTmp[val].sc_name });
                        }
                        oData.unshift( oTitle );

                        Search.shopSearch.oHopeShipInfo[Search.shopSearch.iCurrentShopNo] = oData;

                        Search.shopSearch.createMultiSelectHtml("#hopeShippingCompanyByShop", oData, 'HopeShipCompanyId[]');
                    },
                    error : function(e) {}
                });
            } else {
                Search.shopSearch.createMultiSelectHtml("#hopeShippingCompanyByShop", Search.shopSearch.oHopeShipInfo[Search.shopSearch.iCurrentShopNo], 'HopeShipCompanyId[]');
            }
        },
        /**
         * 선택된 쇼핑몰이 사용중인 은행정보 가져와 갱신
         */
        setBankInfo : function () {
            var getBankMode = "bankInfo";

            if ( !Search.shopSearch.oDepositBankInfo[Search.shopSearch.iCurrentShopNo] ) {
                var sParam = 'getMode=' + getBankMode + '&getShopMode=SHOP&shop_no=' + Search.shopSearch.iCurrentShopNo;
                var sUrl = getMultiShopUrl('/admin/php/s_new/order_get_json.php');

                $.ajax({
                    url : sUrl,
                    data : sParam,
                    success : function(r) {
                        var oTmp = $.parseJSON(decodeURIComponent(r));
                        var oTitle = { 'value' : '0', 'name' : __('ALL','ADMIN.JS.ORDERS.ORDER.SEARCH')};
                        var oData = [];
                        var sValue = '';
                        var sName = '';
                        for ( var i in oTmp ) {
                            sValue = oTmp[i].bank_code + ':' + oTmp[i].bank_acc_no;
                            sName = oTmp[i].bank_name + ' : ' + oTmp[i].bank_acc_no + '(' + oTmp[i].bank_depositor + ')';
                            oData.push({ 'value' : sValue, 'name' : sName });
                        }
                        oData.unshift( oTitle );

                        Search.shopSearch.oDepositBankInfo[Search.shopSearch.iCurrentShopNo] = oData;

                        Search.shopSearch.createMultiSelectHtml("#bankInfoByShop", oData, 'bank_info[]');

                    },
                    error : function(e) {}
                });
            } else {
                Search.shopSearch.createMultiSelectHtml("#bankInfoByShop", Search.shopSearch.oDepositBankInfo[Search.shopSearch.iCurrentShopNo], 'bank_info[]');
            }

        },

        setRefundBankInfo : function () {
            var getBankMode = "bankAllInfo";

            if ( !Search.shopSearch.oDepositBankInfo[Search.shopSearch.iCurrentShopNo] ) {
                var sParam = 'getMode=' + getBankMode + '&getShopMode=SHOP&shop_no=' + Search.shopSearch.iCurrentShopNo;
                var sUrl = getMultiShopUrl('/admin/php/s_new/order_get_json.php');

                $.ajax({
                    url : sUrl,
                    data : sParam,
                    success : function(r) {
                        var oTmp = $.parseJSON(decodeURIComponent(r));
                        var oTitle = { 'value' : '0', 'name' : __('ALL','ADMIN.JS.ORDERS.ORDER.SEARCH')};
                        var oData = [];
                        var sValue = '';
                        var sName = '';
                        for ( var i in oTmp ) {

                            if (pageName =='payment_list') {
                                sValue = oTmp[i].bank_code + ':' + oTmp[i].bank_acc_no;
                                sName = oTmp[i].bank_name + ' : ' + oTmp[i].bank_acc_no + '(' + oTmp[i].bank_depositor + ')';
                            } else {
                                sValue = oTmp[i].bank_code;
                                sName = oTmp[i].bank_name;
                            }

                            oData.push({ 'value' : sValue, 'name' : sName });

                        }
                        oData.unshift( oTitle );

                        Search.shopSearch.oDepositBankInfo[Search.shopSearch.iCurrentShopNo] = oData;

                        var oTarget = $("select[name='bank_info']");
                        Search.shopSearch.createOptionHtml(oTarget, oData);
                    },
                    error : function(e) {}
                });
            } else {
                var oTarget = $("select[name='bank_info']");
                Search.shopSearch.createOptionHtml(oTarget, Search.shopSearch.oDepositBankInfo[Search.shopSearch.iCurrentShopNo]);
            }
        },

        /**
         * 선택된 쇼핑몰이 사용중인 회원등급 정보 가져와 갱신
         */
        setShopMemberGrade : function () {

            if ( !Search.shopSearch.oMemberGradeInfo[Search.shopSearch.iCurrentShopNo] ) {
                var sParam = 'getMode=memberGrade&getShopMode=SHOP&shop_no=' + Search.shopSearch.iCurrentShopNo;
                var sUrl = getMultiShopUrl('/admin/php/s_new/order_get_json.php');

                $.ajax({
                    url : sUrl,
                    data : sParam,
                    success : function(r) {
                        var oTmp = $.parseJSON(decodeURIComponent(r));
                        var oTitle = { 'value' : 'all' , 'name' : __('MEMBER','ADMIN.JS.ORDERS.ORDER.SEARCH') }; // 회원
                        var oData = [];
                        for ( var val in oTmp ) {
                            oData.push({ 'value' : oTmp[val].group_no, 'name' : oTmp[val].group_name });
                        }
                        oData.unshift( oTitle );

                        Search.shopSearch.oMemberGradeInfo[Search.shopSearch.iCurrentShopNo] = oData;
                        Search.shopSearch.createMemberGroupMultiSelect('#memberGroupList', oData, 'group_no[]');
                    },
                    error : function(e) {}
                });
            } else {
                Search.shopSearch.createMemberGroupMultiSelect('#memberGroupList', Search.shopSearch.oMemberGradeInfo[Search.shopSearch.iCurrentShopNo], 'group_no[]');
            }

        },
        createMemberGroupMultiSelect : function (sTargetId, oData, sInputName) {

            // 선택 안 함 -> 선택 안 함
            // 전체 -> 전체
            // 회원 일부 -> 회원그룹전체
            // 회원그룹전체 -> 회원그룹전체
            // 회원 일부 + 비회원 -> 전체
            // 비회원 -> 비회원

            let bAsIsAllChecked = $(sTargetId).siblings('li.all').find('label input').attr('checked'); // 전체 체크 여부
            let bAsIsAllMemChecked = $(sTargetId).children('label').children('input:checkbox').attr('checked'); // 회원그룹 전체 체크 여부
            let bAsIsHasCheckedGroup = bAsIsAllMemChecked ? true : $(sTargetId).children('ul').find('input:checkbox:checked').length > 0; // 회원그룹중 일부 체크된 경우
            let bAsIsNonMemChecked = $(sTargetId).siblings('li').find('#nonMember').attr('checked'); // 비회원 체크 여부

            let bTobeAllChecked, bTobeAllMemChecked, bTobeNonMemChecked;

            if (bAsIsAllChecked === true) { // 전체 -> 전체
                bTobeAllChecked = bTobeAllMemChecked = bTobeNonMemChecked = true;
            } else {
                bTobeAllMemChecked = bAsIsHasCheckedGroup; // 일부 -> 회원전체
                bTobeNonMemChecked = bAsIsNonMemChecked; // 비회원 -> 비회원
                bTobeAllChecked = bTobeAllMemChecked === true && bTobeNonMemChecked === true; // 회원전체 & 비회원 -> 전체
            }

            $(sTargetId).children('ul').html('');
            let oUl = $(sTargetId).children('ul');
            if (oData.length > 1) {
                for (let i in oData) {
                    if (i == 0) continue;
                    $(oUl).append(
                        $("<li></li>").html("<label class='gLabel'><input type='checkbox' name='" + sInputName + "' class='fChk' value='" + oData[i].value + "'> " + oData[i].name + "</label>")
                    );
                }
                if (bTobeAllMemChecked) {
                    $(sTargetId).children('ul').find('input:checkbox').each((idx, oInput) => {
                        $(oInput).attr('checked', true);
                    });
                }

                $(sTargetId).siblings('li.all').find('label input').attr('checked', bTobeAllChecked); // 전체
                $(sTargetId).children('label').children('input:checkbox').attr('checked', bTobeAllMemChecked); // 회원그룹전체
                $(sTargetId).siblings('li').find('#nonMember').attr('checked', bTobeNonMemChecked); // 비회원

                let oTarget = $(sTargetId).parents('.mNewDropSelect');
                Search.multiSelect.setMultiSelectEvent(oTarget);
                Search.multiSelect.setSelectedValueString(oTarget);
            }
        },

        /**
         * 선택된 쇼핑몰이 사용중인 배송업체 정보 가져와 html 갱신
         */
        setShopShipCompany : function () {

            if ( !Search.shopSearch.oShipInfo[this.iCurrentShopNo] ) {
                var sParam = 'getMode=shippingCompany&getShopMode=SHOP&shop_no=' + this.iCurrentShopNo;
                var sUrl = getMultiShopUrl('/admin/php/s_new/order_get_json.php');

                $.ajax({
                    type : 'post',
                    url : sUrl,
                    data : sParam,
                    success : function(r) {
                        var oTmp = $.parseJSON(r);
                        var oTitle = { 'value' : 'all', 'name' : __('ALL','ADMIN.JS.ORDERS.ORDER.SEARCH')}; // 희망배송업체
                        var oData = [];
                        for ( var val in oTmp ) {
                            oData.push({ 'value' : oTmp[val].sc_id, 'name' : oTmp[val].sc_name });
                        }
                        oData.unshift( oTitle );

                        Search.shopSearch.oShipInfo[Search.shopSearch.iCurrentShopNo] = oData;

                        Search.shopSearch.createMultiSelectHtml('#shippingCompanyByShop', oData, 'ShipCompanyId[]');
                    },
                    error : function(e) {}
                });
            } else {
                Search.shopSearch.createMultiSelectHtml('#shippingCompanyByShop', Search.shopSearch.oShipInfo[Search.shopSearch.iCurrentShopNo], 'ShipCompanyId[]');
            }

        },
        createMultiSelectHtml : function (sTargetId, oData, sInputName ) {
            if (oData.length > 1) {
                $(sTargetId).next().children('select').css('display', 'none');
                $(sTargetId).css('display', 'inline-block');


                let oListLi = $(sTargetId).find('ul.list li.all');
                $(oListLi).html('');
                $(oListLi).append($("<label></label>").addClass('gLabel').html("<input type='checkbox' name='" + sInputName + "' class='fChk' value='" + oData[0].value + "'> " + oData[0].name));
                $(oListLi).append($("<ul></ul>"));
                let oUl = $(oListLi).find('ul');
                for (let i in oData) {
                    if (i == 0) continue;
                    $(oUl).append($("<li></li>").html("<label class='gLabel'><input type='checkbox' name='" + sInputName + "' class='fChk' value='" + oData[i].value + "'> " + oData[i].name + "</label>"));
                }
                let oTarget = $(sTargetId);
                Search.multiSelect.setMultiSelectEvent(oTarget);
                Search.multiSelect.setSelectedValueString(oTarget);
            } else {
                $(sTargetId).next().children('select').css('display', 'block');
                $(sTargetId).css('display', 'none');
                $(sTargetId).find('ul.list li.all').html('');
            }
        },
        /**
         * SelectBox 내의 option 가공
         *
         * @param sTarget $('') 안에 들어갈 Html 가공 대상.
         * @param oData option 값과 텍스트 들고있는 데이터. value,name의 Key로 구성됨.
         */
        createOptionHtml : function ( oTarget, oData ) {
            oTarget.html('');
            for (var i in oData) {
                let oOption = $("<option></option>").html(oData[i].name);
                $(oOption).val(oData[i].value);
                oTarget.append(oOption);
            }
        },

    }

    Search.mainSearch = {
        defaultSearchTypeElemnt : null,
        init : function ()
        {
            this.setDefaultSearchType();
            this.setInitLoadedSearchZone();
            this.setEventWhenSearchKeyValueChange();
        },
        setDefaultSearchType : function ()
        {

            this.defaultSearchTypeElemnt = $("#mainSearch div:first").clone();//로드시 검색어영역의 첫번째 div을 복제해서 +버튼클릭시 추가될 검색어영역(select,input등)을 준비
            this.defaultSearchTypeElemnt
                .addClass("gSingle")
                .find('.mNoticeTip').remove()
                .end()
                .find("a.btnIcon")
                    .removeClass("icoPlus")
                    .addClass("icoMinus")
                .end()
                .find("select option:selected").removeAttr("selected")
                .end()
                .find(".productSearchBtn").attr('style', 'display:none')
                .end()
                .find("input").val("");

        },
        setInitLoadedSearchZone : function ()
        {//페이지로딩시 최초검색어영역의 Element에 대한 이벤트 세팅
                var optionCnt = 5;
                if (typeof(SEARCH_SIMPLIFY) != 'undefined'){
                    SEARCH_SIMPLIFY.setIsAlert(false);
                }
                $("#mainSearch")
                    .find("select")
                        .each(function(){$(this).data("value",this.value).siblings("input[type=text]").data("orderType",this.value);})
                        .change(function(){
                            Search.mainSearch.checkDuplicateSearchType.call(this);
                            Search.mainSearch.checkProductSearchType.call(this);
                            Search.mainSearch.checkLabelSearchType.call(this);
                        })
                    .end()
                    .find("input[type=text]")
                        .keyup(function(){Search.mainSearch.checkRestriction.call(this);})
                    .end()
                    .find(".icoPlus")
                        .live('click', function(e){
                            e.preventDefault();

                            if ($("#mainSearch select").length >= optionCnt) {
                                alert(sprintf(__('CAN.CREATE.SEARCH.FIELDS','ADMIN.JS.ORDERS.ORDER.SEARCH'), optionCnt)); // 검색필드는 최대 %s까지 만드실수 있습니다.
                                return false;
                            }
                            //검색어 +버튼 클릭시 하위영역에 검색필드를 추가해줌
                            var cloneSearchElement = Search.mainSearch.defaultSearchTypeElemnt.clone();
                            cloneSearchElement.val("choice");
                            cloneSearchElement
                                .find("select")
                                    .unbind("change")
                                    .bind("change",function(){
                                        Search.mainSearch.checkDuplicateSearchType.call(this);
                                        Search.mainSearch.checkProductSearchType.call(this);
                                        Search.mainSearch.checkLabelSearchType.call(this);
                                    })
                                .end()
                                .find("a.btnIcon.icoMinus")
                                    .click(function(){$(this).parent().remove();})
                                .end()
                                .find("input[type=text]")
                                    .keyup(function(){Search.mainSearch.checkRestriction.call(this);})
                                    .keydown(function(e) {
                                        if ($(this).data("autocomplete") !== undefined && $(this).data("autocomplete").menu.active) {
                                            // 자동완성검색 선택시 이벤트 발생 안함
                                        } else {
                                            if (e.keyCode == 13) {
                                                if (Search.mainSearch.checkValid() == true) {
                                                    $("input[name='realclick']").val('T');
                                                    document.frm.submit();
                                                }
                                            }
                                        }
                                    })
                                .end()
                                .find("option")
                                    .attr("selected",false)
                                .end()
                                .find("option[value='choice']")
                                    .attr("selected",true)
                                .end();
                            $("#mainSearch").append(cloneSearchElement);
                            Search.productSearch.setInitProductSearchBtn();
                            Search.productSearch.setInitInputElement();
                            Search.mainSearch.setEventWhenSearchKeyValueChange();
                        })
                    .end();

            $(".icoMinus").live('click', function () {
                $("#eOrderProductNo").val('');
                $(this).parent().remove();
            })

        },
        /**
         * 검색타입선택시 중복타입이 있는지 체크
         * */
        checkDuplicateSearchType : function()
        {
            var obj = $(this);
            obj.addClass("currentElement");//선택된 셀렉트박스를 제외하기 위해 class 추가

            if ($("#mainSearch select:not(.currentElement) option:selected")
                    .map(function(){
                        return ( (obj.val() != "choice" && obj.val() != "line1" && obj.val() != "line2" && obj.val() != "line3" && obj.val() != "line4" )&& obj.val() == this.value) ? 1 : 0;
                        })
                    .get().join().indexOf(1) > -1) {
                            alert(__('SELECT.ANOTHER.SEARCH.ITEM','ADMIN.JS.ORDERS.ORDER.SEARCH')); // 이미 선택한 검색항목입니다. 다른 검색항목을 선택해주세요.
                            obj.val(obj.data("value")?obj.data("value"):"choice")
                               .removeClass("currentElement");
                            if (SHOP.isMobileAdmin() === true) {
                                $('.ec-mobile-admin-orders-search-keyword-type').eq($(this).index('select[name="MSK[]"]')).val('choice');
                            }
                             return false;
                    }

            if (['product_name', 'product_code', 'item_code', 'product_tag'].indexOf(obj.val()) > -1) {
                obj.data("value", 'choice').removeClass("currentElement");
            } else {
                obj.data("value", obj.val()).removeClass("currentElement");
            }
            obj.siblings("input").data("orderType",this.value);

        },
        /**
         * 상품 검색타입 선택시 "상품찾기" 노출
         */
        checkProductSearchType : function ()
        {
            let obj = $(this);
            if (['product_name', 'product_code', 'item_code', 'product_tag', 'manufacturer_name', 'supplier_name'].indexOf(obj.val()) < 0) return false;
            obj.parent().find('.productSearchBtn').attr('style', 'display:inline-block;');
        },
        /**
         * 라벨 검색
         */
        checkLabelSearchType : function ()
        {
            let obj = $(this);
            if (['labels'].indexOf(obj.val()) < 0) {
                ORDER_LABEL_SEARCH.exec.destroy(obj.parent().find('.sBaseSearchBox'));
                return false;
            }
            ORDER_LABEL_SEARCH.init(obj.parent().find('.sBaseSearchBox'));
        },

        /**
         * 페이지 로딩시 라벨검색 세팅
         * ㄴ ('.sBaseSearchBox').keydown() 이벤트 선언 이후 선언되어야 한다.
         * ㄴ 자동완성 선택시 keydonw()이벤트 충돌 선택시 submit되는 현상이 발생된다.
         */
        setLabelSearch : function ()
        {
            //검색어가 라벨인경우
            $("select[name='MSK[]']").each(function() {
                Search.mainSearch.checkLabelSearchType.call(this);
            });
        },

        /**
         * 검색타입별 제한조건체크
         * @return array
         * bState : 결과반환 [true|false]
         * sReturnData : 변환데이터반환
         * */
        checkRestriction : function ()
        {   var sData = this.value;
            var sReturnData = sData;
            var bReturnState = true;

            if ( $("#sIsSearchWordLength").val() != 'undefined' && $("#sIsSearchWordLength").val() == 'T') {
                MAX_SEARCH_WORD_LENGTH = 8000;
                MAX_SEARCH_WORD_BYTE = 16000;
            }

            if (sData.length > MAX_SEARCH_WORD_LENGTH) {
                alert(sprintf(__('ONLY.CHARACTERS.ALLOWED','ADMIN.JS.ORDERS.ORDER.SEARCH'), MAX_SEARCH_WORD_LENGTH)); // %s자까지만 가능합니다.
                bReturnState = false;
                sReturnData = this.value.cut(MAX_SEARCH_WORD_BYTE);
                return {"bState":bReturnState,"sData":sReturnData};
            }

            if (sData.bytes > MAX_SEARCH_WORD_BYTE) {
                alert(sprintf(__('ONLY.CHARACTERS.ALLOWED','ADMIN.JS.ORDERS.ORDER.SEARCH'), MAX_SEARCH_WORD_LENGTH));
                bReturnState = false;
                sReturnData = this.value.cut(MAX_SEARCH_WORD_LENGTH);
                return {"bState":bReturnState,"sData":sReturnData};
            }

            var orderType = $(this).data("orderType");
            switch (orderType) {
                case "client_ip":
                    var aReturnData = Search.fn.isIp(this.value);
                    bReturnState = aReturnData.bState;
                    sReturnData = aReturnData.sData;
                    break;
            }
            return {"bState":bReturnState,"sData":sData};
        },
        checkValid : function ()
        {
            /**
             * 검색어 필드가 초기 로딩시 기본 한개가 세팅되며 세팅된 한개의 검색어 필드는 미입력시 유효성체크되지 않고 넘어감
             */
            if ($("#mainSearch input").length <= 1 && $("#mainSearch input").val() == "" && $("#bOrderPrivOrderSearch").val()=='T') {
                return true;
            }

            var elemSelect = $("#mainSearch select option:selected").filter("[value=choice],[value^=line]");
            if (elemSelect.length > 0) {
                alert(__('SELECT.SEARCH.TERM.ENTRY','ADMIN.JS.ORDERS.ORDER.SEARCH')); // 검색어 항목을 선택해주세요.
                elemSelect.first().parent().focus();
                return false;
            }

            var elemEmptyInput = [];
            let iElementCount = 0;
            $("#mainSearch input").each(function(idx, oInput){
                if ($(oInput).attr('type') == 'hidden') return;
                iElementCount++;
                if ($(oInput).val() == "") {
                    elemEmptyInput.push(this);
                }
            });

            if ( $("#bOrderPrivOrderSearch").val()=='F' && iElementCount == elemEmptyInput.length ) {
                // 주문검색제한이 걸린 부운영자인 경우 검색어 입력 없이 검색 불가능 ECHOSTING-143699
                alert(__('SENSITIVE.INFORMATION','ADMIN.JS.ORDERS.ORDER.SEARCH')); // 검색조건을 입력해주세요.
                return false;
            }

            var aElemInput = $("#mainSearch input[type='text']").get();
            for ( var i = 0; i < aElemInput.length; i++){
               var aReturnData =  this.checkRestriction.call(aElemInput[i]);
               if (aReturnData.bState == false) {

                   aElemInput[i].focus();

                   if (SHOP.isMobileAdmin() === true) {
                       var sName = $(aElemInput[i]).attr('name');
                       var iIndex = $('input[name="'+sName+'"]').index();
                       $('input[data-name="'+sName+'"]').eq(iIndex).focus();
                   }

                   return false;
               }
            }
            return true;
        },
        setEventWhenSearchKeyValueChange : function ()
        {
            // 상품찾기로 상품선택한 이후, input text 입력시 선택한 상품 초기화
            $(".sBaseSearchBox").each((idx, oSearchTextInput) => {
                $(oSearchTextInput).keyup((e) => {
                    if (['product_name', 'product_code', 'item_code', 'product_tag', 'manufacturer_name', 'supplier_name'].indexOf($(oSearchTextInput).siblings("select[name='MSK[]']").find("option:selected").val()) < 0) return;
                    $(oSearchTextInput).siblings("#eOrderProductNo").val('');
                });
            });

            // 검색 Key 변경시 order_product_no 값 제거
            $("select[name='MSK[]']").each((idx, oSearchSelect) => {
                $(oSearchSelect).change((e) => {
                    $(oSearchSelect).siblings("#eOrderProductNo").val('');
                    if (['product_name', 'product_code', 'item_code', 'product_tag', 'manufacturer_name', 'supplier_name'].indexOf($(oSearchSelect).find("option:selected").val()) < 0) {
                        $(oSearchSelect).siblings('.productSearchBtn').attr('style', 'display:none;');
                    }
                });
            })

        }
    };

    Search.dateSearch = {
        init : function ()
        {
            this.setInitToday();
            this.setInitTime();
            this.setViewCalendarBtn();
            this.setTermsBtn();
            this.setDefaultTermsBtn();
        },
        setInitToday : function ()
        {   //로딩시 endDate는 오늘날짜임.
            this.aToday = $("#today").val().split("-");
        },
        setInitTime : function ()
        {
            var sTimeSearchused = $('#useTimeSearchFlag').val();

            if (sTimeSearchused == 'F') {
                $('#start_time').attr('disabled','disabled');
                $('#start_time').attr('style','display: none;');
                $('#end_time').attr('disabled','disabled');
                $('#end_time').attr('style','display: none;');
            }
        },
        setViewCalendarBtn : function ()
        {
            var dnDate = new Date();
            var current_year = dnDate.getFullYear();
            $.Calendar_status = true;
            $("#eStartCalendar").Calendar({
                'pop_calendar'  : 'mCalendar',
                'years_between' : [2005, current_year+1],
                'target' : "#startDate",
                'callback_func' : Search.dateSearch.callbackCheckDate
            });
            $("#eEndCalendar").Calendar({
                'pop_calendar'  : 'mCalendar',
                'years_between' : [2005, current_year+1],
                'target' : "#endDate"
            });
        },

        //duetDatePicker.js로 이동
        callbackCheckDate : function ()
        {
            // 주문처리 15개월이상의 주문 데이터 출력되는 페이지
            var aCheckList = [
                // 입금전 관리
                'payment_list.php',
                'payment_list_item.php',
                // 배송완료 조회
                'shipped_complete_list_ord_num.php',
                'shipped_complete_list_dlv_num.php',
                'shipped_complete_list_product.php',
                // 전체주문 조회
                'order_list.php',
                'order_list_item.php',
                // 해외배송 전체주문 조회
                'order_list_overseas.php',
                'order_list_item_overseas.php',
                // 입금전취소 관리
                'auto_order_cancel_list.php',
                // 취소 관리
                'order_cancel.php',
                // 교환 관리
                'order_change.php',
                // 반품 관리
                'order_returns.php',
                // 환불 관리
                'order_cash_refund_f.php',
                // 카드취소 조회
                'order_card_refund_f.php',
                // 관리자환불 관리
                'order_admin_refund_f.php',
                // 세금계산서 관리 > 미신청내역 관리
                'none_tax_list.php',
                // 관리자 메모 조회
                'admin_memo_list.php'
            ];

            // 페이지별로 분기처리를 위한 페이지명 세팅
            var aPath = window.location.pathname.split('/')
            var sCurrentPageName = aPath[aPath.length - 1];

            // 주문처리가 완료된 주문이 노출되는 페이지만 검증해서 처리 필요
            if (aCheckList.indexOf(sCurrentPageName) < 0) return;

            var aSelectDate = $('#startDate').val().split('-');
            var oSelectDate = new Date(aSelectDate[0], (parseInt(aSelectDate[1]) - 1), aSelectDate[2]);

            // 15개월이 지난 데이터에 대한 안내를 위해 세팅
            var oNowDate = new Date();
            var oIntervalDate = new Date(oNowDate.getFullYear(), oNowDate.getMonth() - 36, oNowDate.getDate());

            var iDiffDay = oIntervalDate - oSelectDate;

            if (iDiffDay > 0 && $("#bIsNewProduct").val() == true && $("#bExistColdData").val() == true) {
                let sMessage = __('ORDERS.MORE.THAN.MONTHS', 'ADMIN.JS.ORDERS.ORDER.SEARCH');
                if (sCurrentPageName === 'admin_memo_list.php') sMessage = __('MEMOS.ADDED.ORDERS', 'ADMIN.JS.ORDERS.ORDER.SEARCH');
                alert(sMessage);
                $("#eStartCalendar").triggerHandler("click"); //캘린더창 유지시킴
            }
        },

        setTermsBtn : function ()
        {
            $(".btnDate").click(function() {
                var iDateInterval = parseInt($(this).attr('date-interval'), 10);
                Search.dateSearch.setTermsDate(iDateInterval);
                $("#btnDate").val(iDateInterval);
                $(".btnDate").removeClass("selected");
                $(this).addClass("selected");
            });
        },
        setDefaultTermsBtn : function ()
        {
            var fCallBackFunc = function() {
                var searchTimeUsed = $("input[name='searchTimeUsed']:checked").val();
                $('#useTimeSearchFlag').val(searchTimeUsed);
                if (searchTimeUsed == 'F') {
                    $('#start_time').attr('disabled','disabled');
                    $('#start_time').attr('style','display: none;');
                    $('#end_time').attr('disabled','disabled');
                    $('#end_time').attr('style','display: none;');
                } else {
                    $('#start_time').removeAttr('disabled');
                    $('#start_time').removeAttr('style');
                    $('#end_time').removeAttr('disabled');
                    $('#end_time').removeAttr('style');
                }

                $(this).parent().parent().hide();
                $('#searchTimeUsed').val(searchTimeUsed);
            };

            var fCallCancelFunc = function() {
                var sSetData = $('#useTimeSearchFlag').val();

                $("input[name='searchTimeUsed']").each(function() {
                    if ( $(this).val() == sSetData ) {
                        $(this).attr('checked', true);
                        $(this).parent().addClass('eSelected');
                    } else {
                        $(this).removeAttr('selected');
                        $(this).parent().removeClass('eSelected');
                    }
                });
            };

            $("#QA_defaultTermBtn").bind("click",fCallBackFunc);
            $("#QA_defaultTermCancelBtn").bind("click",fCallCancelFunc);
        },
        setTermsDate : function (term)
        {
            // 날짜 검색이 월로 들어왔을경우 ( 초기에는 30,90,180 일수로 개월을 세팅해서 중간에 로직변경하느라고 기존 일수 그대로 -개월로 매칭 )
            var aTermMonths = [];
            aTermMonths.push({ 'value' : -1, 'name' : 30 });
            aTermMonths.push({ 'value' : -3, 'name' : 90 });
            aTermMonths.push({ 'value' : -6, 'name' : 180 });

            var sStartDate = null;
            var sEndDate = null;

            var fSetMonth = null;

            // 선택한 기간이 1개월 ~ 6개월 사이에 있을 경우  fSetMonth <-- 이놈이 null 또는 -1 부터 -6까지
            for (var i in aTermMonths) {
                var fMonth = aTermMonths[i]['value'];
                var sMonthName = aTermMonths[i]['name'];
                if (sMonthName == term ) { fSetMonth = fMonth; }
            }

            var sEndDate = this.aToday;
            var oDate = new Date();
            var iYear = oDate.getFullYear();
            var sMonth  = ""+(oDate.getMonth()+1);
            var sDay = ""+oDate.getDate();
            var aNoThirtyOne = [2,4,6,9,11]; // 31일 미만인 월

            // 일별 날짜 세팅 버튼 클릭
            if (fSetMonth == null ) {
                oDate.setFullYear(sEndDate[0],sEndDate[1]-1,sEndDate[2]);
                term = parseInt(term);
                oDate.setDate(oDate.getDate()-term);
                var iYear = oDate.getFullYear();
                var sDay = ""+oDate.getDate();
                var sMonth  = ""+(oDate.getMonth()+1);
                sStartDate = iYear+"-"+sMonth.lpad("0",2)+"-"+sDay.lpad("0",2);
                $("#startDate").val(DATEPICKER.setYmdToSelectedDateFormat(sStartDate));
                $("#startDate").closest(".duet-date-picker").val(sStartDate);
            }
            // 월 별 날짜 세팅 클릭
            else {
                var iDay = oDate.getDate();

                // 1일 기준으로 월만 변경(마이너스이면 자동으로 년까지 변경됨)하여 년, 월을 구합니다.
                oDate.setDate(1);
                oDate.setMonth(oDate.getMonth() + fSetMonth);

                // 일을 셋팅하여 일이 변경되었다는 것은 월이 변경되었다는 것이므로(월이 1 증가했을 것임) 일을 0으로 강제셋팅하여 그 전달 마지막 날짜가 되도록 합니다.
                oDate.setDate(iDay);
                if (oDate.getDate() != iDay) {
                    oDate.setDate(0);
                }

                var iYear = oDate.getFullYear();
                var sMonth  = ""+(oDate.getMonth()+1);
                var sDay = ""+oDate.getDate();

                sStartDate = iYear+"-"+sMonth.lpad("0",2)+"-"+sDay.lpad("0",2);
                $("#startDate").val(DATEPICKER.setYmdToSelectedDateFormat(sStartDate));
                $("#startDate").closest(".duet-date-picker").val(sStartDate);
            }

            sEndDate = sEndDate[0]+"-"+sEndDate[1]+"-"+sEndDate[2];
            $("#endDate").val(DATEPICKER.setYmdToSelectedDateFormat(sEndDate));
            $("#endDate").closest(".duet-date-picker").val(sEndDate);

            return {start_date : sStartDate, end_date : sEndDate}
        },
        checkValid : function ()
        {
            var oDate = new Date();
            var sEndDate = this.aToday;
            var sStartTime = $("#start_time").val().replace(/:/g,"");
            var sEndTime = $("#end_time").val().replace(/:/g,"");

            if (CAFE24.GLOBAL_INFO.getCountryCode() === 'VN' && DATEPICKER.getDateFormat() === 'm-d-Y' && SHOP.isMobileAdmin() === false) {
                var sStartDate = /^(\d{4})-(\d{2})-(\d{2})$/.test($("#startDate").val()) ? $("#startDate").val().replace(/^(\d{4})-(\d{2})-(\d{2})$/, '$2$3$1') : $("#startDate").val().replace(/-/g, "");
                var sEndDate = /^\d{4}-\d{2}-\d{2}$/.test($("#endDate").val()) ? $("#endDate").val().replace(/^(\d{4})-(\d{2})-(\d{2})$/, '$2$3$1') : $("#endDate").val().replace(/-/g, "");
            } else {
                var sStartDate = $("#startDate").val().replace(/-/g, "");
                var sEndDate = $("#endDate").val().replace(/-/g, "");
            }

            var iLimitDay = 0;
            var sMessage = '';

            var sTermToday = parseInt(  oDate.setFullYear( oDate.getFullYear(), oDate.getMonth()+1, oDate.getDate()   )  );

            sStartDate = DATEPICKER.setYmdDateFormat(sStartDate).replace(/-/g,"");
            sEndDate = DATEPICKER.setYmdDateFormat(sEndDate).replace(/-/g,"");

            var sTermStartDate = parseInt( oDate.setFullYear(  sStartDate.substring(0,4) ,sStartDate.substring(4,6), sStartDate.substring(6,8) ));
            var sTermEndDate = parseInt( oDate.setFullYear(  sEndDate.substring(0,4) ,sEndDate.substring(4,6), sEndDate.substring(6,8) ));

            var iSec = 60;
            var iTerm =  (sTermEndDate - sTermStartDate) /1000;
            iTerm = iTerm/iSec;
            iTerm = iTerm/iSec;
            iTerm = iTerm/24;

            if (sStartDate > sEndDate) {
                alert(__('SELECT.THE.START.DATE','ADMIN.JS.ORDERS.ORDER.SEARCH')); //기간검색의 시작날짜는 종료날짜보다 이전으로 선택해주세요.
                $("#startDate").focus();
                return false;
            }
            else if (sStartDate == sEndDate && sStartTime > sEndTime) {
                alert(__('SEARCH.DATE.START.TIME','ADMIN.JS.ORDERS.ORDER.SEARCH')); // 기간검색의 검색일이 같을 경우 시작시간은 종료시간보다 이전으로 선택해주세요.
                $("#start_time").focus();
                return false;
            }

            if ( ( $('#bOneYearSearchExcept').val() == '1' ) ) {
                iLimitDay = 366;
                sMessage = __('IT.CAN.BE.YEAR','ADMIN.JS.ORDERS.ORDER.SEARCH'); // 기간 검색의 성능과 시스템 안전을 위해 최대 1년까지 가능합니다.\n검색 기간은 1년 미만으로 조정하여 검색해주세요.
            } else {
                iLimitDay = 187;
                sMessage = __('IT.CAN.BE.MONTHS','ADMIN.JS.ORDERS.ORDER.SEARCH'); // 기간 검색의 성능과 시스템 안전을 위해 최대 6개월까지 가능합니다.\n검색 기간은 6개월 미만으로 조정하여 검색해주세요.
            }


            // 전체주문조회 30일 제한
            if ($('#sOrderSearchLimitWhole').val() == 'T') {
                iLimitDay = 34;
                sMessage = __('SEARCH.TIMES.PERFORMANCE','ADMIN.JS.ORDERS.ORDER.SEARCH'); // 기간 검색의 성능과 시스템 안전을 위해 최대 30까지 가능합니다.\n검색 기간은 30일 미만으로 조정하여 검색해주세요.
            } else {
                // 부산 콜센터의 검색 기간 30일 제한
                if ( $('#sIsBusanCallCenter').val() == 'T' && $('#sOrderSearchLimit').val() == 'T') {
                    iLimitDay = 34;
                    sMessage = __('SEARCH.TIMES.PERFORMANCE','ADMIN.JS.ORDERS.ORDER.SEARCH');
                } else if ( $('#sIsBusanCallCenter').val() == 'T' && $('#sOrderSearchLimit').val() != 'T') {
                    iLimitDay = 94;
                    sMessage = __('SEARCH.TIMES.PERFORMANCE.001','ADMIN.JS.ORDERS.ORDER.SEARCH'); // 기간 검색의 성능과 시스템 안전을 위해 최대 90까지 가능합니다.\n검색 기간은 90일 미만으로 조정하여 검색해주세요.
                }
            }


            // 최대 184일 이상 검색을 요청할경우 break ( 7월부터 12월 까지 하믄 184일 걸림 )
            if (iTerm > iLimitDay ) {
                alert(sMessage);
                $("#start_time").focus();
                return false;
            }

            // 주문실패 관리는 최근 6개월 주문만 검색 가능 (ECHOSTING-207477)
            if ($("#searchPage").val() == 'order_fail_list') {
                var iTermToday = (sTermToday - sTermStartDate) /1000;
                iTermToday = iTermToday/iSec;
                iTermToday = iTermToday/iSec;
                iTermToday = iTermToday/24;

                if (iTermToday > 187) {
                    alert('6개월 이전의 주문실패내역은 조회할 수 없습니다. 기간을 다시 선택해 주세요');
                    $("#start_time").focus();
                    return false;
                }
            }

            if ( $("#bOrderPrivOrderSearch").val()=='F' ) {
                // 주문검색제한이 걸린 부운영자인 경우 검색 시작일이 최근 1년안이어야 함. ECHOSTING-143699
                var iTermToday = (sTermToday - sTermStartDate) /1000;
                iTermToday = iTermToday/iSec;
                iTermToday = iTermToday/iSec;
                iTermToday = iTermToday/24;

                if (iTermToday > 366) {
                    alert(__('INFORMATION.AVAILABLE','ADMIN.JS.ORDERS.ORDER.SEARCH')); // 최근 1년 동안의 주문 정보만 조회 가능합니다.
                    $("#start_time").focus();
                    return false;
                }
            }
            return true;
        }

    }

    Search.productSearch = {
        init : function ()
        {
            this.setInitProductSearchBtn();
            this.setInitInputElement();
        },
        getSerchWordSize : function ()
        {
          var iLength = 200;
          var iBytes = 400;
          return { length:iLength,byte:iBytes }
        },
        setInitInputElement : function ()
        {

            $("#eOrderProductName").keyup(function(){
                var aRestrictionResult = Search.productSearch.checkRestriction(this.value);
                if (aRestrictionResult.bState == false) {
                    $(this).val(aRestrictionResult.sData);
                }
            });

            // 상품찾기로 상품선택한 이후, input text 입력시 선택한 상품 초기화
            $(".sBaseSearchBox").each((idx, oSearchTextInput) => {
                $(oSearchTextInput).keyup((e) => {
                    if (['product_name', 'product_code', 'item_code', 'product_tag', 'manufacturer_name', 'supplier_name'].indexOf($(oSearchTextInput).siblings("select[name='MSK[]']").find("select option:selected").val()) < 0) return;
                    $(oSearchTextInput).siblings("#eOrderProductNo").val('');
                });
            });
        },
        setInitProductSearchBtn : function ()
        {
            Search.productSearch.addProductSearchPopup();
            $("#productSearchBtn, #ec-mobile-admin-order-search-product").click(() => {
                // productSearchBtn 마켓모드
                Search.productSearch.popProductSearch()
            });
        },
        addProductSearchPopup : function()
        {
            $(".productSearchBtn").each(function(index, item) {
                $(item).click((e) => {
                    e.preventDefault();
                    Search.productSearch.popProductSearch(index);
                });
            });
        },
        popProductSearch : function(index = null)
        {
            var width = '650';

            //뉴상품인 경우 가로 길이 늘어남. ECHOSTING-58126 krlee
            if ($("#bIsNewProduct").val() === true)
                width = '750';

            if (SHOP.isMode() === true) {
                width = 700;
            }
            var left = (screen.width - width) / 2;
            var top = (screen.height - 700) / 2;
            var url = getMultiShopUrl('/admin/php/s/search_order_product.php');

            var sSearchKey = $("#eProductSearchType").val();

            if (typeof index == "number") {
                sSearchKey = $("select[name='MSK[]']").get(index).value;
            }

            var param = '?SearchKey='+ sSearchKey;

            //주문관리에서 열린 상품찾기 팝업에서만 품목코드 조회 UI 추가되도록  ECHOSTING-58126 krlee
            param += '&sUseItemCodeUI=T';
            param += '&sIndividualSearch=T';
            if (index !== null) {
                param += '&iSearchBoxIndex=' + index;
            }


            if ( typeof($("select[name='shop_no_order']").val()) != 'undefined' ) {
                param += '&searchShopNo=' + $("select[name='shop_no_order']").val();
            }

            if (SHOP.isMobileAdmin() === true) {
                param += '&sCallbackFunc=EC_MOBILE_ADMIN_ORDERS_SEARCH.setSearchProduct';
                MOBILE_ADMIN_UI.openCommonIframeLayer(url + param, true, true);
            } else {
                var winname = 'search_order_product';
                var option = 'toolbar=no, location=no, scrollbars=yes, resizable=no, width='+width+', height=700, top='+ top +', left=' + left;
                opener = window.open(url + param, winname, option);
            }

        },
        checkRestriction : function (sData)
        {

            try {

                var sReturnData = sData;
                var bReturnState = true;

                if (sData.length > MAX_SEARCH_WORD_LENGTH) {
                    alert(__('ONLY.CHARACTERS.ALLOWED.001','ADMIN.JS.ORDERS.ORDER.SEARCH')); // 50자까지만 가능합니다.
                    bReturnState = false;
                    sReturnData = sData.cut(MAX_SEARCH_WORD_BYTE);
                }

                if (sData.bytes > MAX_SEARCH_WORD_BYTE) {
                    alert(__('ONLY.CHARACTERS.ALLOWED.001','ADMIN.JS.ORDERS.ORDER.SEARCH'));
                    bReturnState = false;
                    sReturnData = sData.cut(MAX_SEARCH_WORD_LENGTH);
                }

            }
            catch(e){}

            return {"bState":bReturnState,"sData":sReturnData};


        },
        checkSearchLength : function () {

            if ( $("#eOrderProductText").length > 0 ) { // 상품검색 없는 곳에 대한 예외처리
                if ( $("#eProductSearchType").val() != 'product_code' && $("#eOrderProductText").val().length > 0 ) {
                    if ( $("#eOrderProductText").val().length < 2 ) {
                        alert(__('YOU.MUST.ENTER.CHARACTERS','ADMIN.JS.ORDERS.ORDER.SEARCH')); // 상품코드를 제외한 상품검색은 두글자 이상 입력하셔야 합니다.
                        $("#eOrderProductText").focus();
                        return false;
                    }
                }
            }

            var returnValue = true;
            $(".sBaseSearchBox").each((idx, oBaseSearchBox) => {
                if ($(oBaseSearchBox).val().length > 0) {
                    if (['product_name', 'item_code', 'product_tag', 'manufacturer_name', 'supplier_name'].indexOf($("select[name='MSK[]'] option:selected").val()) > -1) {
                        if ($(oBaseSearchBox).val().length < 2) {
                            alert(__('YOU.MUST.ENTER.CHARACTERS', 'ADMIN.JS.ORDERS.ORDER.SEARCH')); // 상품코드를 제외한 상품검색은 두글자 이상 입력하셔야 합니다.
                            $(oBaseSearchBox).focus();
                            returnValue = false;
                            return false;
                        }
                    }
                }
            });

            return returnValue;
        },
        checkValid : function ()
        {
            var elemOrderProductName = $("#eOrderProductName");
            var aRestrictionResult = this.checkRestriction(elemOrderProductName.val());
            if (aRestrictionResult.bState == false){
                elemOrderProductName.focus();
                return false;
            }
            if ( this.checkSearchLength() === false ) {
                return false;
            }
            return true;
        }
    }

    Search.depositStatus = {
        init : function ()
        {
            this.setClickEvent();
        },
        setClickEvent : function ()
        {
            $("#depositStatus input[value=3]").click(function(){
                this.checked = "checked";/*전체는 클릭시 해제없고 무조건 체크*/
                $("#depositStatus input:not([value=3])").parent().removeClass("eSelected");
                $("#depositStatus input:not([value=3])").attr("checked",false);
            });
            $("#depositStatus input:not([value=3])").click(function(){
                if($("#depositStatus input:not([value=3])").filter(":checked").length <= 0) {
                    $("#depositStatus input[value=3]").parent().addClass("eSelected");
                    $("#depositStatus input[value=3]").attr("checked",true);
                } else {
                    $("#depositStatus input[value=3]").parent().removeClass("eSelected");
                    $("#depositStatus input[value=3]").attr("checked",false);
                }
            });

        }

    }

    Search.orderState = {
        init : function ()
        {
            this.setEvent();

            this.setCsOrderSearchEvent();
        },
        setEvent : function ()
        {

            $("#orderStatusCheck :checkbox[value=all]").bind("change",function(){
                $("#orderStatusCheck input").not("[value=all]").attr("checked",this.checked);
                if (this.checked == true) {
                    $("#orderStatusCheck label").addClass("eSelected");
                    $('.ec-mobile-order-search-order-status').addClass('active');
                } else {
                    $("#orderStatusCheck label").removeClass("eSelected");
                    $('.ec-mobile-order-search-order-status').removeClass('active');
                }

            });
            if($("#orderStatusCheck :checkbox[value=all]").attr("checked")) {
                $("#orderStatusCheck :checkbox[value=all]").triggerHandler("change");

                if (SHOP.isMobileAdmin() === true) {
                    $('.ec-mobile-order-search-order-status').removeClass('active').addClass('active')
                }
            }

            $("#orderStatusCheck :checkbox").not("[value=all]").bind("change",function(){
                // 인플루언서 모드인 경우 상품준비중은 제외
                var oSelect = $("#orderStatusCheck :checkbox").not(":checked,[value=all]");

                var isChecked = false;
                if(oSelect.length > 0) {
                    $("#orderStatusCheck :checkbox[value=all]").parent().removeClass("eSelected").removeClass('active');
                } else {
                    $("#orderStatusCheck :checkbox[value=all]").parent().addClass("eSelected").addClass('active');
                    isChecked = true;
                }

                $("#orderStatusCheck :checkbox[value=all]").attr("checked", isChecked);
            });
        },

        setCsOrderSearchEvent : function () {
            if (SHOP.isMode() === false) {
                return;
            }

            $('#ec-order-search-cs-order-status').change(function () {
                $(".ec-order-search-cs-order-status").attr("checked", this.checked);
                if (this.checked == true) {
                    $("#ec-order-search-cs-order-status").parent().addClass("eSelected active");
                } else {
                    $("#ec-order-search-cs-order-status").parent().removeClass("eSelected active");
                }
            });

            $('.ec-order-search-cs-order-status').not('[id="ec-order-search-cs-order-status"]').change(function () {
                var oSelect = $(".ec-order-search-cs-order-status").not(':checked,[id="ec-order-search-cs-order-status"]');

                var isChecked = false;
                if(oSelect.length > 0) {
                    $("#ec-order-search-cs-order-status").parent().removeClass("eSelected active");
                } else {
                    $("#ec-order-search-cs-order-status").parent().addClass("eSelected active");
                    isChecked = true;
                }

                $("#ec-order-search-cs-order-status").attr("checked", isChecked);
            });

            if ($(".ec-order-search-cs-order-status").not(':checked,[id="ec-order-search-cs-order-status"]').length < 1) {
                $("#ec-order-search-cs-order-status").parent().addClass("eSelected active");
                $("#ec-order-search-cs-order-status").attr("checked", true);

                if (SHOP.isMobileAdmin() === true) {
                    $('.ec-mobile-order-search-cs-order-status').removeClass('active').addClass('active')
                }
            }
        }

    };

    Search.orderStatusCancel = {
        init : function () {
            if (SHOP.isMode() === false) {
                return;
            }

            $('#orderCSStatus :checkbox[value=allCheck]').bind('click', function () {
                $("#orderCSStatus input").not('[value="allCheck"]').attr("checked", this.checked);
                if (this.checked == true) {
                    $("#orderCSStatus label").addClass("eSelected");
                } else {
                    $("#orderCSStatus label").removeClass("eSelected");
                }
            });

            if($("#orderCSStatus :checkbox[value=allCheck]").attr("checked")) {
                $("#orderCSStatus :checkbox[value=allCheck]").triggerHandler("click");
            }

            $("#orderCSStatus :checkbox").not("[value=allCheck]").bind("click",function(){

                if($("#orderCSStatus :checkbox").not(":checked,[value=allCheck]").length > 0) {
                    $("#orderCSStatus :checkbox[value=allCheck]").attr("checked", false).parent().removeClass("eSelected");
                } else {
                    $("#orderCSStatus :checkbox[value=allCheck]").attr("checked", true).parent().addClass("eSelected");
                }

            });
        }
    };

    Search.refundType = {
        init : function ()
        {
            this.setSubType();
            this.setEvent();
        },
        setEvent : function ()
        {
            $("#manage_type").bind("change",function(){
                Search.refundType.setSubType();
                $("#refund_sub_type").val('all');
                $('input:radio[name="RefundSubType"]').parent().removeClass('active');
                $('input:radio[name="RefundSubType"][value="all"]').attr('checked', true).parent().addClass('active');
            });

            const oRefundTypeCash = $("#RefundTypeCash");
            $("input[name='bank_info[]']").live('click', function() {
                if ($(this).attr('checked') === true) {
                    oRefundTypeCash.attr('checked', true);
                } else {
                    var bAllChecked = true;
                    var bOneMoreChecked = false;
                    $("input[name='bank_info[]']").each((i, val) => {
                        if ($(val).attr('checked') === true) {
                            bOneMoreChecked = true;
                        } else {
                            bAllChecked = false;
                        }
                    });
                    if (!bOneMoreChecked || bAllChecked) {
                        oRefundTypeCash.attr('checked', false);
                    }
                    if (bAllChecked) {
                        $("#bank_info_all").attr('checked', true);
                    }
                }
            });
        },
        setSubType : function ()
        {
            var sManageType = $("#manage_type").val();
            var pageName = $("input[name='pageName']").val();

            if (pageName != 'payment_list') {
                $('#bank_info').hide();
            }
            // 전체, 휴대폰, 계좌이체, 신용카드, 편의점, 기타 일때
            if (sManageType == 'all' || sManageType == 'F' || sManageType == 'E' || sManageType == 'C' || sManageType == 'O' || sManageType == 'V' || sManageType == 'I' || sManageType == 'Z' || sManageType == 'J' || sManageType == 'K') {
                if (sManageType == 'F' || sManageType == 'Z') { // 휴대폰,후불은 부분취소 없음
                    $("#refund_sub_type  option[value='M']").remove();
                    $('input:radio[name="RefundSubType"][value="M"]').parent().hide();
                } else {
                    if ( $("#refund_sub_type option").eq(2).val() != 'M' ) {
                        $("#refund_sub_type option").eq(2).before($("<option></option>").val('M').html(__('PART.CANCELED.COMPLETE','ADMIN.JS.ORDERS.ORDER.SEARCH'))); // 부분취소완료
                    }
                    if ($('input:radio[name="RefundSubType"][value="M"]').parent().is(':visible') === false) {
                        $('input:radio[name="RefundSubType"][value="M"]').parent().show();
                    }
                }
                $("#refund_sub_type").removeAttr("disabled");
                $('.ecmobile-order-search-refund-sub-type').removeClass('disabled');
                $('.ecmobile-order-search-refund-sub-type').removeAttr('disabled');
            } else {
                // 글로벌몰은 은행선택 Select Box 노출 안함
                if (CAFE24.GLOBAL_INFO.isGlobal() === false && sManageType =='B') {
                    $('#bank_info').show();
                    $('#ec-mobile-order-search-refund-bank-info').show();
                }
                $("#refund_sub_type").attr('disabled','disabled');
                $('.ecmobile-order-search-refund-sub-type').attr('disabled','disabled');
                $('.ecmobile-order-search-refund-sub-type').addClass('disabled');
            }
        }
    }

    /**
     * 결제수단/결제업체/주문경로 상세검색 레이어
     */
    Search.detailSearchLayer = {
        init: function () {
            this.setPaymentMethodInit();
            this.setPgListInit();
            this.setOrderPathInit();
            this.setCheckEvent();
        },
        setPaymentMethodInit : function() {
            var iCheckedCount = 0;
            var iEleCount = $('.paymentMethod').length;
            $('.paymentMethod').each (function() {
                if ($(this).attr('checked') === true) iCheckedCount++;
            });
            if (iCheckedCount == iEleCount) {
                $('#checkAllPaymentMethod').attr('checked', true);
                $('#checkAllPaymentMethod').closest('label').addClass('eSelected');
            }
        },
        setPgListInit : function() {
            var iCheckedCount = 0;
            var iEleCount = $('.pgList').length;
            if (iEleCount > 0) {
                $('.pgList').each(function () {
                    if ($(this).attr('checked') === true) iCheckedCount++;
                });
                if (iCheckedCount == iEleCount) {
                    $('#checkAllPgList').attr('checked', true);
                    $('#checkAllPgList').closest('label').addClass('eSelected');
                }
            }
        },
        setOrderPathInit : function() {
            var iCheckedCount = 0;
            var iEleCount = $('.orderPath').length;
            $('.orderPath').each (function() {
                if ($(this).attr('checked') === true) iCheckedCount++;
            });
            if (iCheckedCount == iEleCount) {
                $('#checkAllOrderPath').attr('checked', true);
                $('#checkAllOrderPath').closest('label').addClass('eSelected');
            }
        },
        setCheckEvent : function() {
            // 결제업체 "설정" 클릭 시
            $('#openPgListLayer').click(function(){
                var iEleCount = $('.pgList').length;
                if (iEleCount < 1) {
                    alert(__('NO.PAYMENT.PROVIDER.USE', 'ADMIN.JS.ORDERS.ORDER.SEARCH'));
                    return false;
                }
            });
            // 결제수단 전체선택
            $('#checkAllPaymentMethod').click(function() {
                Search.detailSearchLayer.checkAll($(this).attr('checked'), 'paymentMethod');
            });
            // 결제수단 선택
            $('.paymentMethod').click(function() {
                Search.detailSearchLayer.checkOne($(this).attr('checked'), 'paymentMethod', 'checkAllPaymentMethod');
            });
            // 결제업체 전체선택
            $('#checkAllPgList').click(function () {
                Search.detailSearchLayer.checkAll($(this).attr('checked'), 'pgList');
            });
            // 결제업체 선택
            $('.pgList').click(function() {
                Search.detailSearchLayer.checkOne($(this).attr('checked'), 'pgList', 'checkAllPgList');
            });
            // 주문경로 전체선택
            $('#checkAllOrderPath').click(function () {
                Search.detailSearchLayer.checkAll($(this).attr('checked'), 'orderPath');
            });
            // 주문경로 선택
            $('.orderPath').click(function() {
                Search.detailSearchLayer.checkOne($(this).attr('checked'), 'orderPath', 'checkAllOrderPath');
            });
        },
        // 전체선택 액션
        checkAll : function (bAllChecked, sClassName) {
            $('.' + sClassName).each(function(){
                $(this).attr('checked', bAllChecked);
                if (bAllChecked === true) {
                    $(this).closest('label').addClass('eSelected');
                } else {
                    $(this).closest('label').removeClass('eSelected');
                }
            });
        },
        // 단일선택 액션
        checkOne : function (bChecked, sClassName, idName) {
            if (bChecked === true) {
                var iCheckedCount = 0;
                var iEleCount = $('.' + sClassName).length;
                $('.' + sClassName).each(function () {
                    if ($(this).attr('checked') === true) iCheckedCount++;
                });
                // 모두 선택되었을 때 '전체선택' 체크
                if (iCheckedCount == iEleCount) {
                    $('#' + idName).attr('checked', true);
                    $('#' + idName).closest('label').addClass('eSelected');
                }
            } else {
                $('#' + idName).attr('checked', false);
                $('#' + idName).closest('label').removeClass('eSelected');
            }
        }
    }

    /**
     * 할인수단
     *
     */
    Search.discountMethod = {

        init : function() {
            this.setEvent();
        },

        setEvent : function() {

            // 할인수단 input text 표시유무
            $("input[name='discountMethod[]']").change(function () {
                var sInputText = $(this).data("input-text");
                if (sInputText != '' && sInputText != undefined) {
                    var oInputText = $("input[name='" + sInputText + "']");
                    if (oInputText.length > 0) {
                        if ($(this).attr("checked") == true) {
                            oInputText.show();
                        } else {
                            oInputText.hide();
                        }
                    }
                }
            });

            $("#discountMethodAll").change((e) => {
                let discountCodeInput = $("#discountCode");
                if (discountCodeInput.length > 0) {
                    if ($(e.target).attr("checked") === true) {
                        discountCodeInput.show();
                    } else {
                        discountCodeInput.hide();
                    }

                }
            })
        }

    }
    // END - inflowPath()

    Search.memberType = {
        init : function ()
        {
            this.setMemberTypeChoice();
        },
        setMemberTypeChoice : function ()
        {
            // 선택된 그룹이 하나라도 있으면 member type 2 checked JS
            $("#memberGroupList").find("label").each((idx, oLabel) => {
                const self = $(oLabel);
                self.click(() => { Search.memberType.setMemberChecked() });
            });

            // 초기 로딩시 memberType 2(member) checked
            Search.memberType.setMemberChecked();

            // 블랙리스트 체크박스 관련 js
            $("#memberTypeSelectUl").find('input:checkbox').change((e) => {
                Search.memberType.displayAndUncheckBlacklistOrder(e.target);
            });

            // 초기 로딩시 블랙리스트 노출여부
            Search.memberType.displayAndUncheckBlacklistOrder();
        },

        displayAndUncheckBlacklistOrder : function (oTarget)
        {

            let oBlackOrder = $("input[name='isBlackOrder']");
            let bMemberTypeAllChecked = $("#memberTypeAll").attr('checked');
            let bNonmemberChecked = $("#nonMember").attr('checked');
            let bChangeFlag = null;

            if ($(oTarget).attr('id') === 'nonMember') {
                bChangeFlag = bNonmemberChecked;
            } else if ($(oTarget).attr('id') === 'memberTypeAll') {
                bChangeFlag = bMemberTypeAllChecked;
            } else {
                bChangeFlag = bMemberTypeAllChecked || bNonmemberChecked;
            }

            if (bChangeFlag) {
                $("#blackListOrder").attr('style', 'display:inline-block');
            } else {
                $("#blackListOrder").attr('style', 'display:none');
                $(oBlackOrder).attr('checked', false);
            }
        },

        setMemberChecked : function ()
        {
            const oMemberType2 = $("#memberType2");
            var memberType2Check = false;
            $("#memberGroupList").find("input[name='group_no[]']").each((idx2, oInput) => {
                if ($(oInput).attr('checked')) {
                    memberType2Check = true;
                    return true;
                }
            });
            if (oMemberType2.length > 0) {
                $(oMemberType2).attr('checked', memberType2Check);
            }
        }

    }

    Search.payTerms = {

        init : function ()
        {
            this.setNumberFormat();
        },
        setNumberFormat : function ()
        {
            var pattern = /\.0$/gi;
            $("#product_total_price1,#product_total_price2,.ecmobile-order-search-amount").keyup(function(e){
                if (this.value == "") return false;
                //소수점둘째자리까지만 지원함
                var str = this.value.replace(/([0-9,]*[.])([0-9]{2})(.*)/g,"$1$2");
                var aStr= str.split(".");
                var sTailStr= "";
                /**소수점을 나타내는 '.'이 한개이상일때 한개외 나머지 소수점제거**/
                if (aStr.length > 2) {
                    if (aStr[0] == "") {
                        str = 0;
                    }
                    if(typeof aStr[0] == "string") str = aStr[0].replace(/,/g,"");
                    str = CAFE24.SHOP_PRICE.toShopPrice(str,true);
                    str = str+".";
                    for (var i=1;i<aStr.length;i++) {
                        str += aStr[i];
                        sTailStr += aStr[i];
                    }
                    this.value = str;
                    return false;
                } else {
                    if (aStr[0] == "") {
                        str = "0."+aStr[1];
                    }
                    sTailStr = aStr[1];
                }
                if (e.which > 47 && e.which != 110 && e.which != 190 && Search.payTerms.isNumber(str) && !pattern.test(str)) {
                    if(typeof str === "string") str = str.replace(/,/g,"");
                    var iPrice = CAFE24.SHOP_PRICE.toShopPrice(str,true);
                    /**한화이외의 통화의 경우 toShopPrice에서 반환되는 값이 소수점 2자리까지 자동으로 붙기때문에 xx.00,xx.x0등에서 0을 제거해준다**/
                if (aStr.length > 1 && sTailStr != "") {
                        var aPrice = (iPrice+"").split(".");
                        iPrice = aPrice[0]+"."+sTailStr;
                        this.value = iPrice;
                    } else {
                        this.value = (iPrice+"").replace(/[.]{1}(00|0)$/g,"");
                    }
                } else if (!Search.payTerms.isNumber(str)) {
                        alert(__('YOU.CAN.ENTER.THE.NUMBER','ADMIN.JS.ORDERS.ORDER.SEARCH')); // 금액조건은 숫자만 입력 가능합니다.
                        this.value = str.replace(/[^0-9.,]/gi,"");
                }

            });
        },
        setMobileAdminFocus : function () {
            //if (SHOP.isMobileAdmin() ===)
        },
        checkValid : function ()
        {
            $("#product_total_price1, #product_total_price2").each(function(){
                this.value = this.value.replace(/[.]$/gi,"");
                this.value = this.value.replace(/^[.]/gi,"0.");
            });

            var bIsMobileAdmin = SHOP.isMobileAdmin();

            if ($("#product_total_price1").length > 0 && (Search.payTerms.isNumber($("#product_total_price1").val()) === false || ($("#product_total_price1").val() != "" && $("#product_total_price1").val().replace(/[,.]/g,"") == ""))) {
                alert(__('THIS.NUMERIC.ENTRY.ONLY','ADMIN.JS.ORDERS.ORDER.SEARCH')); // 숫자로만 입력 가능한 항목입니다.
                $("#product_total_price1, #ec-mobile-admin-order-search-price-min").focus();
                return false;
            }
            if ($("#product_total_price2").length > 0 && (Search.payTerms.isNumber($("#product_total_price2").val()) === false  || ($("#product_total_price2").val() != "" && $("#product_total_price2").val().replace(/[,.]/g,"") == ""))) {
                alert(__('THIS.NUMERIC.ENTRY.ONLY','ADMIN.JS.ORDERS.ORDER.SEARCH'));
                $("#product_total_price2, #ec-mobile-admin-order-search-price-max").focus();
                return false;
            }
            if ($("#ePayStandard").val() == "choice"){
                if ($("#product_total_price1,#product_total_price2").map(function(){return this.value}).get().join("").length > 0) {
                    alert(__('SELECT.AMOUNT.STANDARD','ADMIN.JS.ORDERS.ORDER.SEARCH')); // 금액기준을 선택해주세요.
                    $("#ePayStandard,#ec-mobile-admin-order-search-price-type").focus();
                    return false;
                }
            }

            if ($("#product_total_price1").length > 0 && parseFloat($("#product_total_price1").val().replace(/[,]/g,"")) > parseFloat($("#product_total_price2").val().replace(/[,]/g,"")) ) {
                alert(__('PLEASE.ENTER.THE.AMOUNT.001','ADMIN.JS.ORDERS.ORDER.SEARCH')); // 금액은 작은금액 ~ 큰금액 순서로 입력하여 검색해주세요.
                $("#product_total_price2, #ec-mobile-admin-order-search-price-max").focus();
                return false;
            }
            return true;
        },
        isNumber : function (sValue)
        {
            var pattern = /[^0-9.,]/gi;
            return !pattern.test(sValue.replace(/,/g,""));
        }
    }

    Search.itemCount = {
        init : function ()
        {
            this.setOnlytNumber();
        },
        setOnlytNumber : function ()
        {
            $("#item_count_start,#item_count_end").keyup(function(){
                if (this.value == "") return false;
                Search.itemCount.deleteNonNumber(this, this.value);
            });
        },
        deleteNonNumber : function (oInput, inputVal)
        {
            // 숫자만 입력 가능하도록 처리
            inputVal = inputVal.replace(/[^0-9]/,'');
            inputVal = inputVal.replace(/(^0+)/,'');

            oInput.value = inputVal;
        }
    }

    Search.detailView = {
        init : function ()
        {
            this.setClickEvent();
            this.checkInitOpen();
            this.setDetailCaseCheckAll();
            this.setMarketSearchStandard();
        },
        setClickEvent : function ()
        {
            $('.eOrdToogle').bind("click", function(){ Search.detailView.toggleDetail(this); });
            $('.eOptionToggle').bind("click", function(){ Search.detailView.toggleDetailStretch(this); });
        },
        checkInitOpen : function ()
        {
            var sSearchDetailView = $("#sSearchDetailView").val();
            var sSearchDetailStretch = $("#sSearchDetailStretch").val();

            if ( sSearchDetailView == "T" ) {
                //suio.js에 있는 소스 삽입 - ui팀과 협의하여 function으로 만들어야됨
                var findThis = $('.eOrdToogle'),
                findTarget = findThis.parents('.mOptionToogle:first').prev('.gDivision');
                findTarget.show();
                findThis.parent('span').addClass('selected');
                findThis.text(__('CLOSE','ADMIN.JS.ORDERS.ORDER.SEARCH'));
                $('.detailSearchNoticeTip').addClass('hide');
            }

            if ( sSearchDetailStretch == 'T' ) {
                var findThis = $("button.eOptionToggle"),
                findParent = findThis.parents('.mSearchSelect:first'),
                findList = findParent.find('.list'),
                propFix = findThis.attr('fix');
                // scroll 고정 여부
                if (propFix == undefined){
                    var propScrollHeight = 'auto';
                } else {
                    var propScrollHeight = propFix + 'px';
                }
                findThis.addClass('selected');
                findThis.find('span').text(__('REDUCE.ENTIRE','ADMIN.JS.ORDERS.ORDER.SEARCH')); // 전체 줄이기
                findList.css({'height':propScrollHeight});
            }

        },
        toggleDetail : function (obj)
        {
            var findThis = $(obj),
            findTarget = findThis.parents('.mOptionToogle:first').prev('.gDivision');
            let beforeCss = findTarget.css('display');
            if (beforeCss === 'block'){
                $("#sSearchDetailView").val('F');
                $('.detailSearchNoticeTip').removeClass('hide');
            } else {
                $("#sSearchDetailView").val('T');
                $('.detailSearchNoticeTip').addClass('hide');
            }
        },
        toggleDetailStretch : function (obj)
        {
            if ( $(obj).hasClass('selected') === true ) {
                $("#sSearchDetailStretch").val('F');
            } else {
                $("#sSearchDetailStretch").val('T');
            }
        },
        hideDetail : function ()
        {
            $('.eOrdToogle').trigger("click");
        },
        setDetailCaseCheckAll : function ()
        {
            var sSelector = '#detailCase table thead input[type=checkbox]';
            $(sSelector)
                .each(
                    function(){
                        var parentElement = $(this);
                        var childElement = $("."+this.id);
                        function _initAllCheckBox() {
                            parentElement.attr("checked",function(){
                                var bAllChecked = (childElement.length == childElement.filter(":checked").length);
                                $(this).parents('label:first').toggleClass("eSelected",bAllChecked);
                                return bAllChecked;
                            });
                        }
                        /*각영역의 전체체크하는 체크박스를 선택시 각영역의 체크박스들을 전체체크 또는 미체크를 수행*/
                        parentElement.change(function () {
                                var bChecked = $(this).attr("checked");
                                childElement.attr("checked",function(){
                                    $(this).parents('label:first').toggleClass("eSelected",bChecked);
                                    return bChecked;
                                });
                        });
                        /*각영역의 체크박스의 전체체크 또는 천체 미체크여부를 판단하여 각영역의 전체체크하는 체크박스를 체크 또는 미체크로 변경하는 함수*/
                        childElement.change(_initAllCheckBox);

                        /*초기실행시 각영역의 체크박스가 전체체크 또는 전체미체크일 경우 각영역의 전체체크하는 체크박스의 체크 또는 미체크를 수행함*/
                        _initAllCheckBox();

                    }
                );
        },
        setMarketSearchStandard : function ()
        {
            $("#eBtnSaleStandard").click(function(){
                setCookie("marketSearchStandardType",$(":radio[name=mkSaleType]:checked").val(),15);
                $('#mkSaleTypeChg').val('T');
                $("input[name='realclick']").val('T');
                document.frm.submit();
            })
        }
    }

    Search.submit= {

        init : function ()
        {
            this.setQaBtnSearch();
        },

        setQaBtnSearch : function ()
        {
            var submit = this.exec;

            // 다른 곳에서 frm.action 을 변경하고 취소 후 다시 검색하면 변경된 action으로 수행됨
            // 초기 로딩때 세팅되어져 있는 action 값 세팅 - (ECHOSTING-94103, by wcchoi)
            var sSearchAction = $("form[name='frm']").attr("action");

            $("#search_button").click(function(e) {
                if ($('#sIsOrderSearchNotAllowed').val() == 'T') {
                    alert('이벤트 진행으로 인한 서버부하 감소를 위해 검색 기능이 잠시 제한 되었습니다.');
                    return false;
                }
                e.preventDefault();

                // 스마트모드인 경우 마켓을 모두 선택하지 않으면 전체검색으로 변경
                if (SHOP.isMode() === true) {
                    var $eChildElement = $('input[name="search_SaleOpenMarket[]"]');
                    if ($eChildElement.length > 0 && $eChildElement.filter(":checked").length === 0) {
                        $('input[name="orderPathType"][value="A"]').click();
                        $eChildElement.attr('checked', true);
                    }
                }

                // 부산 콜센터의 경우만 중복클릭 못하도록.
                if ( $('#sIsBusanCallCenter').val() == 'T') {
                    $("form[name='frm']").attr('action', sSearchAction);
                    submit();
                } else {
                    // 일반 몰은 중복 클릭 가능하도록.
                    $("form[name='frm']").attr('action', sSearchAction); // 2014.
                    submit();
                }
            });

            $("#eBtnInit").click(function(e){
                e.preventDefault();

                var bNaviHide = $('#bNaviHide').val();//초기화 버튼 클릭 시 gnb/lnb 숨김처리가 되어 있을경우 유지여부 추가

                // 취소/교환/반품/환불 관리 초기화시 탭 유지 위한 예외 처리
                var aExceptList = [ 'order_cancel', 'order_change', 'order_returns', 'ordercash_refund_f' ];
                var sListName = $('#listName').val();
                var aParams = [];
                if ( typeof(sListName) != 'undefined' ) {
                    if ( $.inArray( sListName, aExceptList ) != -1 ) {
                        aParams.push('tabStatus=' + $("input[name='tabStatus']").val());
                    }
                }
                aParams.push('initSearchFlag=T');
                aParams.push('navi_hide='+bNaviHide);

                document.location.href = sSearchAction + '?' + aParams.join('&');
            });

            $(".sBaseSearchBox").keydown(function(e) {
                if ($(this).data("autocomplete") !== undefined && $(this).data("autocomplete").menu.active) {
                    // 자동완성검색 선택시 이벤트 발생 안함
                } else {
                    checkEventKeyCode(submit, e);
                }
            });
            $("#eOrderProductText").keydown(function(e) { checkEventKeyCode(submit,e); });
            $("#product_total_price1").keydown(function(e) { checkEventKeyCode(submit,e); });
            $("#product_total_price2").keydown(function(e) { checkEventKeyCode(submit,e); });

        },
        exec : function ()
        {
            let startDate = $("#startDate").val().split("-");
            let sEndDate = $("#endDate").val().split("-");
            let dateFormat = SHOP.getDateFormat();

            switch (dateFormat) {
                case "d-m-Y" :
                    $("#year1").val(startDate[2]);
                    $("#month1").val(startDate[1]);
                    $("#day1").val(startDate[0]);
                    $("#year2").val(sEndDate[2]);
                    $("#month2").val(sEndDate[1]);
                    $("#day2").val(sEndDate[0]);
                    break;
                case "m-d-Y" :
                    $("#year1").val(startDate[2]);
                    $("#month1").val(startDate[0]);
                    $("#day1").val(startDate[1]);
                    $("#year2").val(sEndDate[2]);
                    $("#month2").val(sEndDate[0]);
                    $("#day2").val(sEndDate[1]);
                    break;
                default :
                    $("#year1").val(startDate[0]);
                    $("#month1").val(startDate[1]);
                    $("#day1").val(startDate[2]);
                    $("#year2").val(sEndDate[0]);
                    $("#month2").val(sEndDate[1]);
                    $("#day2").val(sEndDate[2]);
            }

            if ( $("#sIsSearchWordLength").val() != 'undefined' && $("#sIsSearchWordLength").val() == 'T') {
                MAX_SEARCH_WORD_CONDITION = 16000;
            }

            var bMinLengthFlag = true;
            $("input[name='MSV[]']").each(function() {
                var aMinLengthExcept = [ 'order_id', 'ord_item_code' ];

                //검색어 trim 처리
                var sSearchString = $(this).val();
                sSearchString = $.trim(sSearchString);
                $(this).val(sSearchString);

                if ( $.inArray($(this).siblings("select[name='MSK[]']").val(), aMinLengthExcept) != -1 && $(this).val().length < 4 && $(this).val().length > 0 ) {
                    bMinLengthFlag = false;
                }
            });

            if ( bMinLengthFlag === false ) {
                alert(__('ORDER.NUMBER.ITEM','ADMIN.JS.ORDERS.ORDER.SEARCH')); // 주문번호, 품목별 주문번호를 개별검색 할 경우 네글자 이상 입력하셔야 합니다.
                $(this).focus();
                return;
            }

            if ($("input[name='MSV[]']").map(function(){return this.value}).get().join().length > MAX_SEARCH_WORD_CONDITION) {
                alert(__('PROCESS.SEARCH','ADMIN.JS.ORDERS.ORDER.SEARCH')); // 검색조건이 너무많아 처리가 불가능합니다. 안전한 검색을 위하여 검색조건을 조정하여 검색해주세요.
                return false;
            }

            $("input[name=realclick]").val('T');
            if (
                Search.mainSearch.checkValid() &&
                Search.dateSearch.checkValid() &&
                Search.productSearch.checkValid() &&
                Search.payTerms.checkValid()
            ){
                if (SHOP.isMobileAdmin() === true) {
                    MOBILE_ADMIN_UI.showPageLoading();
                } else {
                    $('#ordProgress').show();
                }
                $("form[name='frm']").submit();
            }

        }
    }

    Search.fn = {
            isNumber : function (sValue)
            {
                 var pattern = /[^0-9,]+/gi;
                 return this.checkPattern(sValue,pattern, __('ONLY.NUMBERS.CAN.ENTERED','ADMIN.JS.ORDERS.ORDER.SEARCH')); // 숫자만 입력 가능합니다.
            },
            isIp : function (sValue)
            {
                 var pattern = /[^.0-9,]/gi;
                 return this.checkPattern(sValue,pattern, __('ONLY.IP.CAN.BE.INPUT','ADMIN.JS.ORDERS.ORDER.SEARCH')); // IP만 입력 가능합니다.onErrLayer : function (targetLayer, ex, ey) {
            },
            isSpecialString : function (sValue)
            {
                var pattern = /[~!?;:@'"`.#$%^\\+=*(){}<>[\]|=+\/']/gi;
                if(pattern.test(sValue)){
                    //특수문자 제거후 리턴
                    return {"bState":false,"sData":sValue.replace(pattern, "")};
                } else {
                    //특수문자가 없으므로 본래 문자 리턴
                    return {"bState":true,"sData":sValue};
                }
            },
            checkPattern : function (sValue, pattern, msg)
            {
                 var sReturnData = sValue;
                 var bReturnState = pattern.test(sValue);
                 if ( bReturnState ) {
                     alert(msg);
                     sReturnData = sValue.replace(pattern,"");

                 }

                 return {"bState":!bReturnState,"sData":sReturnData};

           }
         }
})();


//pads left
String.prototype.lpad = function(padString, length)
{
  var str = this;
  while (str.length < length)
      str = padString + str;
  return str;
}

//pads right
String.prototype.rpad = function(padString, length)
{
  var str = this;
  while (str.length < length)
      str = str + padString;
  return str;
}

String.prototype.cut = function(len)
{
  var str = this;
  var l = 0;
  for (var i=0; i<str.length; i++) {
          l +=  1;
          if (l > len) return str.substring(0,i) ;
  }
  return str;
}

String.prototype.bytes = function()
{
  var str = this;
  var l = 0;
  for (var i=0; i<str.length; i++) l += (str.charCodeAt(i) > 128) ? 2 : 1;
  return l;
}

$(document).ready(function(){
    Search.load();

    // 모바일이 아닌경우에만 실행
    if (SHOP.isMobileAdmin() === false && !!document.getElementById('bIsPinpointSearch')) {
        //간편주문검색
        var bIsPinpoint = $('#bIsPinpointSearch').val(),
            bResetSearchOption = $('#bResetSearchOption').val();
        if (bIsPinpoint) {
            //간편주문검색을 통해 넘어온 경우modify_order_info_f 스크롤을 살짝 아래로 내린다.
            if (bIsPinpoint === 'T') {
                window.scrollTo(0, 143);
            }
            //간편주문검색을 통해 넘어왔고 검색조건을 초기화여부값 'T'인경우
            if (bIsPinpoint === 'T' && bResetSearchOption === 'T') {
                $('#sBaseSearchBox').val('');
                document.getElementsByName('MSK[]')[0][1].selected = false;
            }
        }
    }
    //ECHOSTING-449255
    $(".eOrdToogle").attr("textopen",__('ADVANCED.SEARCH', 'ADMIN.JS.ORDERS.ORDER.SEARCH'));
    $(".eOrdToogle").attr("textclose",__('CLOSE', 'ADMIN.JS.ORDERS.ORDER.SEARCH'));
});




