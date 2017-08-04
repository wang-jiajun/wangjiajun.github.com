(function ($) {
    var mouseWheelHandle = window.mouseWheelHandle = {
        isMoveMouseWheel: false, /* 判断页面当前是否正在滚动 */
        pageAmount: 0, /* 需要滚动的总页数 */
        currentNumber: 1, /* 当前页码 */
        nextNumber: 0, /* 目标页码 */
        animateTime: 500, /* 默认相邻两页翻页动画时间 */
        circleAnimateTime: 1000, /* 不相邻两页翻页动画时间 */
        //sideBarColors: ["#3a260e", "#724b1d", "#ac722a", "#e0b682", "#e9c9a3", "#f0dbc1"],
        sideBarColors: ["#fff", "#fff", "#fff", "#fff", "#fff", "#fff"],
        body: null,
        doc: null,
        pageHeight: "", /* init 和 resize 计算页面高度 */
        pageWidth: "", /* init 和 resize 计算页面宽度 */
        $mainPage: null, /* 需要翻页的主体 */
        $sideBar: null, /* 导航栏 */
        current: {
            $current: null,
            height: ""
        },
        next: {
            $next: null,
            height: ""
        },
        /**
         * 初始化 option参数
         * mainPage
         * sideBar
         * pageAmount
         * animateTime
         * @param option
         */
        init: function (option) {
            this.pageAmount = option.pageAmount;
            this.animateTime = option.animateTime;

            this.body = document.body;
            this.doc = document.documentElement;

            this.pageHeight = this.doc.scrollHeight || this.body.scrollHeight;
            this.pageWidth = this.doc.scrollWidth;

            this.$mainPage = $(option.mainPage);
            this.$sideBar = $(option.sideBar);
            this.current.$current = this.$mainPage.find(".current");
            this.current.height = this.current.$current.height();
            this.currentNumber = this.current.$current.data("role");

            $('body').on('mousewheel', mouseWheelHandle.mouseWheelAction);
            mouseWheelHandle.bindSideBar();
            mouseWheelHandle.resize();
        },
        /**
         * 作为mousewheel事件绑定的方法；通过event.deltaY判断鼠标滚轮（上/下）移动
         * @param event
         * @returns {boolean}
         */
        mouseWheelAction: function (event) {
            if (!!mouseWheelHandle.isMoveMouseWheel) {
                return false;
            }

            mouseWheelHandle.animateAction((event.deltaY < 0) ? "down" : "up", null, function (num) {
                mouseWheelHandle.changeSideBarColor(num);
            });
        },
        /**
         * 仅相邻两页换页使用
         * @param direction 方向
         * @param nextNumber 目标页码
         * @param func
         */
        animateAction: function (direction, nextNumber, func) {
            mouseWheelHandle.isMoveMouseWheel = true;
            console.log("currentNumber", this.currentNumber);
            this.nextNumber = nextNumber || mouseWheelHandle.getNextRole(direction);
            if (this.currentNumber == 1 && this.nextNumber == 5) {
                mouseWheelHandle.isMoveMouseWheel = false;
                return false;
            }
            this.current.$current = this.$mainPage.find('.pages[data-role="' + this.currentNumber + '"]');
            this.next.$next = this.$mainPage.find('.pages[data-role="' + this.nextNumber + '"]');
            this.next.height = this.next.$next.height();
            direction = direction || ((this.currentNumber < this.nextNumber) ? "down" : "up");
            mouseWheelHandle.animateDoing(direction);
            console.log(this.nextNumber);

            if (typeof func === "function") {
                func(this.nextNumber);
            }
        },
        /**
         * 根据方向返回目标页码
         * @param direction 方向
         * @returns {number} 页码
         */
        getNextRole: function (direction) {
            if (direction === "down") {
                return (this.currentNumber + 1) > 5? 1 : (this.currentNumber + 1);
            } else if (direction === "up") {
                return (this.currentNumber - 1) || this.pageAmount;
            }
        },
        /**
         * 相邻两页处理——目标页放在当前页（上/下）做滚动效果
         * @param direction 方向
         */
        animateDoing: function (direction) {
            this.next.$next.css("top", (direction == "down" ? "" : "-") + this.next.height + "px").css("display", "block");
            this.current.$current.animate({top: (direction != "down" ? "" : "-") + this.current.height + "px"}, this.animateTime);
            this.next.$next.animate({"top": "0px"}, this.animateTime, function () {
                mouseWheelHandle.next.$next.css("top", 0);
                mouseWheelHandle.current.$current.css("display", "none").removeClass("current");
                mouseWheelHandle.current.$current = mouseWheelHandle.next.$next;
                mouseWheelHandle.current.$current.addClass("current");
                mouseWheelHandle.isMoveMouseWheel = false;
                mouseWheelHandle.currentNumber = mouseWheelHandle.nextNumber;
            });
        },
        /**
         * 不相邻两页翻页动效处理
         * @param direction 方向
         * @param current 当前页码
         * @param target 目标页码
         */
        animateDoingCollection: function (direction, current, target) {
            mouseWheelHandle.isMoveMouseWheel = true;
            console.log("animateDoingCollection", current, target);

            this.nextNumber = target;
            this.current.$current = this.$mainPage.find('.pages[data-role="' + current + '"]');
            this.next.$next = this.$mainPage.find('.pages[data-role="' + target + '"]');
            this.next.height = this.next.$next.height();

            mouseWheelHandle.sortPage(direction, current, target);
            mouseWheelHandle.changeSideBarColor(target);
        },
        /**
         * 不相邻两页——按照总页数顺序排序，并且根据 当前页码 和 目标页码 定位数组做top移动动画
         * 1~3  [1,2,3,4,5,6]  current[0,1,2,3,4,5] target[-2,-1,0,1,2,3] 0为屏幕显示的页码
         * @param direction
         * @param current
         * @param target
         */
        sortPage: function (direction, current, target) {
            console.log("sortPage", current, target);
            this.$mainPage.find(".pages").css({top: this.pageHeight + "px"}).css({"display": "block"});
            var pages = [];
            for (var i = 1; i <= mouseWheelHandle.pageAmount; i++) {
                pages.push(i);
            }
            //当前位置排序
            var currentPages = pages.map(function (n) {
                return (n - current);
            });
            //点击后排序位置
            var afterPages = pages.map(function (n) {
                return (n - target);
            });

            var $pages = this.$mainPage.find(".pages");
            for (var i = 0; i < $pages.length; i++) {
                $($pages[i]).css({top: this.pageHeight * currentPages[i] + "px"});
                if (i == $pages.length - 1) {
                    $($pages[i]).animate({top: this.pageHeight * afterPages[i] + "px"}, mouseWheelHandle.circleAnimateTime, function () {
                        console.log("last", mouseWheelHandle.current.$current);
                        mouseWheelHandle.current.$current.css("display", "none").removeClass("current");
                        mouseWheelHandle.current.$current = mouseWheelHandle.next.$next;
                        mouseWheelHandle.current.$current.addClass("current");
                        mouseWheelHandle.isMoveMouseWheel = false;
                        mouseWheelHandle.currentNumber = mouseWheelHandle.nextNumber
                    })
                } else {
                    $($pages[i]).animate({top: this.pageHeight * afterPages[i] + "px"}, mouseWheelHandle.circleAnimateTime)
                }
            }
        },
        /**
         * 右侧导航sideBar点击翻页效果
         */
        bindSideBar: function () {
            this.$sideBar.find(".page-scroll").on("click", function () {
                    if (!!mouseWheelHandle.isMoveMouseWheel) {
                        return false;
                    }
                    var targetN = Number($(this).data("role"));
                    var currentN = mouseWheelHandle.currentNumber;
                    console.log("bindSideBar", currentN, targetN);
                    var direction = (targetN - mouseWheelHandle.currentNumber) > 0 ? "down" : "up";
                    if ($(this).data("role") == mouseWheelHandle.currentNumber) {
                        //console.log("当前页");
                        return false
                    }
                    console.log(targetN);
                    if ((Math.abs(targetN - mouseWheelHandle.currentNumber) == 1)) {
                        mouseWheelHandle.animateAction(direction, targetN, function (targetN) {
                            mouseWheelHandle.changeSideBarColor(targetN);
                        });
                    } else {//不相邻加速翻页
                        mouseWheelHandle.animateDoingCollection(direction, currentN, targetN);
                    }
                }
            );
        },
        /**
         * 右侧导航字体颜色使用背景色反转色
         * @param target
         */
        changeSideBarColor: function (target) {
            console.log(target);
            $(".page-bar a").css("color=black", mouseWheelHandle.sideBarColors[target - 1]);
            $('.page-bar a').removeClass("current");
            $('.page-bar a[data-role="' + target + '"]').addClass("current");
            if (target == 3) {
                mouseWheelHandle.fillPercent();
            } else {
                mouseWheelHandle.fillPercent(true);
            }
/*
            if (target == 4) {
                $('#main-page #page-4 .qualification').css({
                    'transform':' rotate(0deg) scale(1,1)'
                })
            }else{
                $('#main-page #page-4 .qualification').css({
                    'transform':' rotate(-180deg) scale(0.001, 0.001)'
                })
            }
*/
        },


        /**
         * 不相邻两页也做相邻两页翻页处理
         */
        bindSideBarFake: function () {
            this.$sideBar.find(".page-scroll").on("click", function () {
                if (!!mouseWheelHandle.isMoveMouseWheel) {
                    return false;
                }
                var targetN = Number($(this).data("role"));
                var direction = (targetN - mouseWheelHandle.currentNumber) > 0 ? "down" : "up";
                if ($(this).data("role") == mouseWheelHandle.currentNumber) {
                    console.log("当前页");
                    return false
                }

                mouseWheelHandle.animateAction(direction, targetN);
            });
        },
        fillPercent: function (flag) {

            var $percents = $(".skills-percent >.percent");
            for (var i = 0, max = $percents.length; i < max; i++) {
                var $percent = $($percents[i]);
                if (!flag) {
                    $percent.css({'width': $percent.attr('percent') + '%'})
                } else {
                    $percent.css({'width': '0%'})
                }

            }

        },
        resize: function () {
            $(window).resize(function () {
                mouseWheelHandle.body = document.body;
                mouseWheelHandle.doc = document.documentElement;

                mouseWheelHandle.pageHeight = mouseWheelHandle.doc.scrollHeight || mouseWheelHandle.body.scrollHeight;
                mouseWheelHandle.pageWidth = mouseWheelHandle.doc.scrollWidth;

                mouseWheelHandle.current.$currentPage = mouseWheelHandle.$mainPage.find(".current");
                mouseWheelHandle.current.height = mouseWheelHandle.current.$current.height();
            })
        }
    }
})($);
