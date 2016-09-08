'use strict';
angular.module('ion-alpha-nav', [])
    .directive('ionAlphaNav', ['$timeout', '$anchorScroll',
        function($timeout, $anchorScroll) {
            return {
                require: '?ngModel',
                restrict: 'AE',
                replace: true,
                compile: function(tElement, tAttrs, tTransclude) {
                    var children = tElement.contents();
                    var template = angular.element([
                        '<ion-list>',
                        '<ion-scroll delegate-handle="alphaScroll"  overflow-scroll="true">',
                        '<div data-ng-repeat="(letter, items) in sorted | orderBy:sorted.letter" class="ion-alphaNav-list">',
                        '<ion-item class="item item-divider" id="index_{{letter}}">{{letter}}</ion-item>',
                        '<ion-item ng-repeat="item in items"></ion-item>',
                        '</div>',
                        '</ion-scroll>',
                        '<div ng-bind="currentLetter" ng-show="currentLetter!==null" class="currentletter">{{currentLetter}}</div>',
                        '<ul class="ion-alphaNav-bar">',
                        '<li ng-click="alphaScrollGoToList(\'index_{{letter}}\')" ng-repeat="letter in alphabet">{{letter}}</li>',
                        '</ul>',
                        '</ion-list>'
                    ].join(''));
                    var windowWidth = window.innerWidth;
                    var windowHeight = window.innerHeight;
                    var headerHeight = document.querySelector('.bar-header').offsetHeight;
                    var subHeaderHeight = tAttrs.subheader === "true" ? 44 : 0;
                    var tabHeight = document.querySelector('.tab-nav') ? document.querySelector('.tab-nav').offsetHeight : 0;
                    var contentHeight = windowHeight - headerHeight - subHeaderHeight - tabHeight;

                    angular.element(template.find('ion-item')[1]).append(children);
                    tElement.html('');
                    tElement.append(template);
                    tElement.find('ion-scroll').css({ "height": contentHeight + 'px' });

                    return function(scope, element, attrs, ngModel) {
                        if (!ngModel) return;

                        ngModel.$render = function() {
                            scope.items = ngModel.$viewValue;
                            scope.alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
                            scope.sorted = {};
                            scope.currentLetter = null;
                            $timeout(function() {
                                var sidebar_li = angular.element(document.querySelectorAll('.ion-alphaNav-bar li'));
                                sidebar_li.css({ "height": contentHeight / 26 + 'px', "line-height": contentHeight / 26 + 'px' });
                            });
                            for (var i = 0; i < scope.items.length; i++) {
                                var letter = scope.items[i].toUpperCase().charAt(0);
                                if (scope.sorted[letter] === undefined) {
                                    scope.sorted[letter] = [];
                                }
                                scope.sorted[letter].push(scope.items[i]);
                            }
                            scope.alphaScrollGoToList = function(id) {
                                $anchorScroll(id);
                                scope.currentLetter = event.target.innerText;
                            };

                            var sidebar = document.querySelector('.ion-alphaNav-bar');
                            sidebar.addEventListener('touchstart', function() {
                                angular.element(sidebar).addClass('hover');
                            });
                            sidebar.addEventListener('touchend', function() {
                                angular.element(sidebar).removeClass('hover');
                            });
                            sidebar.addEventListener("touchmove", function(event) {
                                event.preventDefault();
                                var x = windowWidth - 1;
                                var y = event.touches[0].pageY;
                                var el = elementFromPoint(x, y);
                                if (el && (scope.alphabet.indexOf(el.innerText) >= 0)) {
                                    $anchorScroll('index_' + el.innerText);
                                    scope.$apply(function() {
                                        scope.currentLetter = el.innerText;
                                    });
                                }
                            });
                            scope.$watch('currentLetter', function(n, o) {
                                if (n != o) {
                                    $timeout(function() {
                                        scope.currentLetter = null;
                                    }, 1000);
                                }
                            });

                            function elementFromPoint(x, y) {
                                var sl,
                                    check = false,
                                    isRelative = true;
                                if (!document.elementFromPoint) {
                                    return null;
                                }

                                if (!check) {
                                    sl = document.body.scrollTop;
                                    if (sl > 0) {
                                        var height = "innerHeight" in window ? window.innerHeight : document.documentElement.offsetHeight;
                                        isRelative = (document.elementFromPoint(0, sl + height - 1) === null);
                                    } else {
                                        sl = document.body.scrollLeft;
                                        if (sl > 0) {
                                            var width = "innerWidth" in window ? window.innerWidth : document.documentElement.offsetWidth;
                                            isRelative = (document.elementFromPoint(sl + width - 1, 0) === null);
                                        }
                                    }
                                    check = (sl > 0);
                                }

                                if (!isRelative) {
                                    x += document.body.scrollLeft;
                                    y += document.body.scrollTop;
                                }
                                return document.elementFromPoint(x, y);
                            }
                        };
                    };
                }
            };
        }
    ]);