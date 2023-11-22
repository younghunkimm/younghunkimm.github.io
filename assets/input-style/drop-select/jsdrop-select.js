'use strict';

const Search = new Object();

Search.load = function() {
    this.dropSelect.init();
}

Search.parents = (el, selector) => {
    const parents = [];

    while ((el = el.parentNode) && el !== document) {
        if (!selector || el.matches(selector)) parents.push(el);
    }
    
    return parents;
}

Search.siblings = (t) => {
    if (typeof t !== 'object') return;

    let children = t.parentNode.children;
    let tempArr = [];

    for (let child of children) {
        tempArr.push(child);
    }

    return tempArr.filter(e => e != t);
}

Search.dropSelect = {
    init() {
        /* 클릭한 대상의 부모요소의 selected 클래스를 toggle */
        const selectToggle = (parent) => {
            const _parent = parent;
            _parent.classList.contains('selected') ? _parent.classList.remove('selected') : _parent.classList.add('selected');
        }

        /* Checkbox 가 있는 Multi Select Box */
        document.querySelectorAll('.drop-select .value .drop-select-btn').forEach(el => {
            el.addEventListener('click', ({target}) => {
                let _height = parseInt(getComputedStyle(target)['height']) + 2;
                document.querySelector('.drop-select .result').style.top = _height + 'px';

                const parentDropSelect = target.parentNode.parentNode;
                let _status = parentDropSelect.classList.contains('selected');
                document.querySelectorAll('.drop-select').forEach(el => {
                    el.classList.remove('selected');
                });
                _status ? parentDropSelect.classList.add('selected') : parentDropSelect.classList.remove('selected');

                selectToggle(parentDropSelect);
            })
        });

        document.querySelectorAll('.drop-select .list .drop-select-btn').forEach(el => {
            el.addEventListener('click', (e) => {
                selectToggle(el.parentNode);
            });
        })

        // 다른영역을 클릭하면 Drop Select box 를 닫는다.
        document.body.addEventListener('mousedown', ({target}) => {
            let isOpenDropSelect = document.querySelectorAll('.drop-select.selected').length;

            if (isOpenDropSelect) {
                const isOpenMultiSelectBox = Search.parents(target, '.drop-select').some(el => el.classList.contains('selected'));

                if (!isOpenMultiSelectBox) {
                    document.querySelectorAll('.drop-select.selected').forEach(el => {
                        el.classList.remove('selected');
                    });
                }
            }
        });

        // 셀렉박스 css 및 event
        this.setDropSelectEvent();
        // 체크안된 중간 depth 체크
        this.setCheckedUpperCheckbox();
        // 셀렉박스 선택값 세팅
        this.setSelectedValueString();
    },
    setDropSelectEvent(targetDropSelect = null) {
        /* 전체 체크박스 js */

        // 셀렉박스의 Label 요소를 가져온다.
        let targetLabel = null;
        if (targetDropSelect !== null) {
            targetLabel = targetDropSelect.querySelectorAll('.g-label');
        } else { // 초기로딩
            targetLabel = document.querySelectorAll('.drop-select .result .list .g-label');
        }
    
        targetLabel.forEach(label => {
            // Label 요소에 이벤트를 등록.
            label.addEventListener('change', ({target}) => {
                // 전체 누른경우
                if (label.parentNode.classList.contains('all')) { // 전체 아니면 선택안함
                    let allListWrapUl = label.parentNode.parentNode; // 전체를 감싸는 ul
                    this.changeAllChildrenCheckbox(allListWrapUl, target.checked); // 전체를 눌렀을 때 셀렉박스 안의 모든 체크박스를 체크여부에 따라 컨트롤.
                } else { // 전체 외의 체크박스
                    const UnderLi = label.parentNode.querySelector('ul'); // 형제 ul을 셀렉트
                    if (UnderLi) { // 하위 체크박스들
                        this.changeAllChildrenCheckbox(UnderLi, target.checked); // 형제 ul > li 안의 모든 체크박스를 체크여부에 따라 컨트롤.
                    }
    
                    // 부모 확인
                    if (!target.checked) {
                        // 내가 false 라면 부모들도 false
                        this.changeParentCheckbox(label, false);
                    } else {
                        // 내가 true 라면 형제 확인하여 부모에 반영, 부모도 형제 확인하여 조부모 checkbox에 반영
                        // 형제가 모두 true 라면 부모도 true, 부모가 모두 true 라면 조부모도 true
                        this.checkSiblingsAndChangeParent(label);
                    }
                }
                // label 의 부모들 중 drop-select 를 찾아 value 값을 바꾼다.
                this.setSelectedValueString(Search.parents(label, '.drop-select'));
            });
        });
    },
    setSelectedValueString(el) {
        if (typeof el === 'undefined') {
            el = document.searchForm.querySelectorAll('.drop-select');
        }

        let valueString = '';
        
        el.forEach(dropSelect => {
            const allCheck = dropSelect.querySelector('li.all input[type=checkbox]');
            if (allCheck.checked) {
                valueString = '전체';
            } else {
                let selectedValue = this.findBottomCheckBox(dropSelect.querySelector('ul.list'));

                if (selectedValue.length > 0) {
                    valueString = selectedValue.join(',');
                } else {
                    valueString = '선택안함';
                }
            }

            if (valueString == "") {
                dropSelect.querySelector('.value span').innerHTML = "&nbsp;";
            } else {
                dropSelect.querySelector('.value span').innerText = valueString;
            }

            // 선택된 옵션 나열 input box 높이 변화에 따른 분리 방지
            let _height = parseInt(getComputedStyle(dropSelect.querySelector('.value'))['height']);
            dropSelect.querySelector('.result').style.top = _height + 'px';
        });
    },
    findBottomCheckBox(el) {
        let selectedValue = [];

        el.querySelectorAll('li').forEach(li => {
            const childUl = li.querySelector('ul');
            
            if (!childUl) {
                if (li.classList.contains('all')) return;
                
                let checkbox = li.querySelector('label input[type=checkbox]');
                if (checkbox.checked) {
                    selectedValue.push(checkbox.parentNode.innerText.trim());
                }
            }
        })

        return selectedValue;
    },
    changeAllChildrenCheckbox(ul, checked) {
        const UnderCheckboxed = ul.querySelectorAll('input[type=checkbox]');
        UnderCheckboxed.forEach(checkbox => {
            if (checkbox.checked !== checked) {
                checkbox.checked = checked;
            }
        })
    },
    changeParentCheckbox(label, checked) {
        // 본인이 "전체" 라면
        let ParentLi = label.parentNode;
        if (!ParentLi) return;
        if (ParentLi.tagName !== 'LI') return;
        if (ParentLi.classList.contains('all')) return; // 더이상 상위 checkbox 없음.
        
        let parentCheckbox;
    
        let ParentUl = ParentLi.parentNode;
        if (ParentUl.classList.contains('list')) { // parent.parent.parent 가 ul list 여서 형제중 li.all (전체) 를 찾아 바꾸는 경우
            parentCheckbox = ParentUl.querySelector('li.all input[type=checkbox]');
        } else { // parent.parent.parent 가 ul 이고, 형제요소가 label 인 경우 해당 label 안의 checkbox 를 담는다.
            parentCheckbox = Search.siblings(ParentUl)
                                .filter(el => el.tagName === 'LABEL')
                                .map(el => el.querySelector('input[type=checkbox]'));
            parentCheckbox = parentCheckbox[0];
        }
    
        if (typeof parentCheckbox !== 'object') return // 더이상 상위 checkbox 없음
    
        if (parentCheckbox.checked !== checked) {
            parentCheckbox.checked = checked;
        }

        if (!checked) { // false 인 경우는 형제 확인 필요없이 부모도 false 로 변경
            parentCheckbox = this.changeParentCheckbox(parentCheckbox.parentNode, false); // checkbox 의 부모인 label 을 넣고 현재 함수 재실행
        }

        return parentCheckbox;
    },
    checkSiblingsAndChangeParent(label) {
        if (!label) return;
        
        /* 본인의 부모(li)를 제외한 나머지 (siblings li)를 배열에 담는다. */
        let SiblingsLi = Search.siblings(label.parentNode).filter(el => el.tagName === 'LI');
        
        if (SiblingsLi.length < 0) return;
    
        let allTrue = true;
    
        SiblingsLi.forEach(li => {
            // 형제 중 "전체" 인 경우는 return
            if (li.classList.contains('all')) return true;
    
            // 형제들의 checked 확인, false 인게 하나라도 있다면 allTrue 값도 false
            if (li.querySelector('label input[type=checkbox]').checked === false) {
                allTrue = false;
                return false;
            }
        });
    
        if (!allTrue) return;

        /**
         * this.changeParentCheckbox => return: checkbox 요소가 넘어온다.
         * 
         * 형제가 모두 true 면 부모에 반영
         */
        const parentCheckbox = this.changeParentCheckbox(label, true);
    
        // return 값이 있다면
        if (parentCheckbox && typeof parentCheckbox === 'object') {
            this.checkSiblingsAndChangeParent(parentCheckbox.parentNode); // checkbox 의 부모인 label 을 넣고 현재 함수 재실행
        }
    },
    setCheckedUpperCheckbox(allDropSelect) {
        if (typeof allDropSelect === 'undefined') {
            allDropSelect = document.searchForm.querySelectorAll('.drop-select');
        }

        allDropSelect.forEach(dropSelect => {
            let allCheckboxChecked = true;
            let allCheckbox = null;

            const Ul = dropSelect.querySelector('ul.list');
            Ul.querySelectorAll('li').forEach(li => {
                const ChildUl = li.querySelector('ul');
                if (li.classList.contains('all') && !ChildUl) { // 대분류 '전체'
                    allCheckbox = li.querySelector('label input[type=checkbox]');
                    return;
                }

                const midDepthCheckbox = li.querySelector('label input[type=checkbox]'); // 중분류

                if (midDepthCheckbox.checked === true) return true;

                let allChecked = true;
                if (ChildUl) {
                    ChildUl.querySelectorAll('li').forEach(li2 => {
                        if (li2.querySelector('input[type=checkbox]').checked === false) {
                            allChecked = false;
                            return false;
                        }
                    });
                    if (allChecked) {
                        li.querySelector('label input[type=checkbox]').checked = true;
                    }
                }

                if (allCheckboxChecked && !allChecked) {
                    allCheckboxChecked = false;
                }
            });

            dropSelect.querySelector('li.all label input[type=checkbox]').checked = allCheckboxChecked;
        })
    }
}

Search.load();