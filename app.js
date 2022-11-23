/*
 * ATTENTION: The "eval" devtool has been used (maybe by default in mode: "development").
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./app.js":
/*!****************!*\
  !*** ./app.js ***!
  \****************/
/***/ (() => {

eval("\r\n\r\nlet dropbox;\r\nlet weekSelector;\r\nlet weekSchedule;\r\nlet version = 1;\r\nlet myBookings = {};\r\n\r\n// let AESencrypt = function(str, key) {\r\n//     return CryptoJS.AES.encrypt(str, key);\r\n// };\r\n//\r\n// let AESdecrypt = function(str, key) {\r\n//     return CryptoJS.AES.decrypt(str, key).toString(CryptoJS.enc.Utf8);\r\n// };\r\n\r\n// function decryptFile(inFile, password) {\r\n//     fs.readFile(inFile, (err, data) => {\r\n//         if (err) throw err;\r\n//         let dectrypted_b64 = CryptoJS.AES.decrypt(data.toString(), password).toString(CryptoJS.enc.Utf8);\r\n//         console.log(dectrypted_b64);\r\n//     });\r\n// }\r\n// Returns the ISO week of the date.\r\n\r\nDate.prototype.getWeek = function() {\r\n    let date = new Date(this.getTime());\r\n    date.setHours(0, 0, 0, 0);\r\n    // Thursday in current week decides the year.\r\n    date.setDate(date.getDate() + 3 - (date.getDay() + 6) % 7);\r\n    // January 4 is always in week 1.\r\n    let week1 = new Date(date.getFullYear(), 0, 4);\r\n    // Adjust to Thursday in week 1 and count number of weeks from date to week1.\r\n    return 1 + Math.round(((date.getTime() - week1.getTime()) / 86400000\r\n        - 3 + (week1.getDay() + 6) % 7) / 7);\r\n};\r\n\r\n// Returns the four-digit year corresponding to the ISO week of the date.\r\nDate.prototype.getWeekYear = function() {\r\n    let date = new Date(this.getTime());\r\n    date.setDate(date.getDate() + 3 - (date.getDay() + 6) % 7);\r\n    return date.getFullYear();\r\n};\r\n\r\nDate.prototype.getPreviousMonday = function() {\r\n    let date = new Date(this.valueOf());\r\n    let day = this.getDay();\r\n    let diff = this.getDate() - day + (day === 0 ? -6:1); // adjust when day is sunday\r\n    return new Date(date.setDate(diff));\r\n};\r\n\r\nDate.prototype.addDays = function(days) {\r\n    this.setDate(this.getDate() + days);\r\n    // let date = new Date(this.valueOf());\r\n    // date.setDate(date.getDate() + days);\r\n    // return date;\r\n};\r\n\r\nDate.prototype.getDayOffset = function(days) {\r\n    let date = new Date(this.valueOf());\r\n    date.setDate(date.getDate() + days);\r\n    return date;\r\n};\r\n\r\nDate.prototype.isSameDay = function(date) {\r\n    return this.getFullYear() === date.getFullYear() &&\r\n        this.getMonth() === date.getMonth() &&\r\n        this.getDate() === date.getDate();\r\n};\r\n\r\nfunction isValidBooking(data) {\r\n    return true;\r\n}\r\n\r\nfunction hideKeyboard(element) {\r\n    element.attr('readonly', 'readonly'); // Force keyboard to hide on input field.\r\n    element.attr('disabled', 'true'); // Force keyboard to hide on textarea field.\r\n    setTimeout(function() {\r\n        element.blur();  //actually close the keyboard\r\n        // Remove readonly attribute after keyboard is hidden.\r\n        element.removeAttr('readonly');\r\n        element.removeAttr('disabled');\r\n    }, 100);\r\n}\r\n\r\nlet getBookings = function() {\r\n\r\n    let fetchTask = new $.Deferred();\r\n\r\n    dropbox.filesListFolder({path: ''})\r\n        .then(data => {\r\n\r\n            let bookings = data.entries\r\n                .filter(booking => booking.name.startsWith(\"slot_\"))\r\n                .map(booking => {\r\n                    let bookingData = {\r\n                        apartment: booking.name.split('_')[1],\r\n                        year: booking.name.split('_')[2],\r\n                        month: booking.name.split('_')[3],\r\n                        day: booking.name.split('_')[4],\r\n                        hour: booking.name.split('_')[5],\r\n                        identifier: booking.name.split('_')[6]\r\n                    };\r\n\r\n                    return bookingData;\r\n                });\r\n\r\n            let duplicateBookings = data.entries\r\n                .filter(booking => booking.name.startsWith(\"slot_\"))\r\n                .map(booking => {\r\n                    // console.log(booking.name, booking.server_modified);\r\n                    return booking.name.split('_').slice(2,6).join('_')\r\n                })\r\n                .reduce((acc, el, i, arr) => {\r\n                    if (arr.indexOf(el) !== arr.lastIndexOf(el)) {\r\n                        if (!acc.hasOwnProperty(el)) acc[el] = [];\r\n                        acc[el].push(data.entries[i]);\r\n                    }\r\n                    return acc;\r\n                }, {});\r\n\r\n            Object.values(duplicateBookings).forEach(dbs => {\r\n                return dbs\r\n                    .sort((a, b) => (new Date(a.server_modified) - new Date(b.server_modified)))\r\n                    .reduce((res, db, i, array) => array.slice(1), [])\r\n                    .forEach(db => {\r\n                        console.log('deleting', db.path_lower);\r\n                        dropbox.filesDelete({path: db.path_lower}).then(() => {\r\n                            console.log('duplicates deleted');\r\n                            weekSchedule[0].reload();\r\n                        });\r\n                    })\r\n            });\r\n\r\n            fetchTask.resolve(bookings);\r\n\r\n        }, console.error);\r\n\r\n    return fetchTask;\r\n};\r\n\r\nclass WeekSelector extends HTMLElement {\r\n    constructor() {\r\n        super();\r\n        let template = document.createElement('template');\r\n        template.innerHTML = `\r\n            <style>\r\n                .info-grid {\r\n                  display: grid;\r\n                  grid-template-columns: 45px auto;\r\n                }\r\n            </style>\r\n            \r\n            <div class=\"info-grid\">\r\n                <div id=\"infoWrapper\"><input data-wrapper-class=\"infoButton\" id=\"info\" type=\"button\"></div>\r\n                <div id=\"headerWrapper\"><input data-wrapper-class=\"headerButton\" id=\"header\" type=\"button\"></div>\r\n            </div>\r\n            <div class=\"ui-grid-b\">\r\n                <div class=\"ui-block-a\"><input class=\"weekSelectButton\" id=\"previous\" type=\"button\" value=\"förra\"></div>\r\n                <div class=\"ui-block-b\"><input class=\"weekSelectButton\" id=\"current\" type=\"button\" value=\"denna vecka\"></div>\r\n                <div class=\"ui-block-c\"><input class=\"weekSelectButton\" id=\"next\" type=\"button\" value=\"nästa\"></div>\r\n            </div>\r\n        `;\r\n        // this.attachShadow({mode: 'open'}).appendChild(template.content.cloneNode(true));\r\n        this.appendChild(template.content.cloneNode(true));\r\n        console.log('WeekSelector constructed');\r\n\r\n        this.currentDate = new Date();\r\n        this.currentWeek = this.currentDate.getWeek();\r\n    }\r\n\r\n    connectedCallback() {\r\n        console.log('WeekSelector connected');\r\n\r\n        $('week-selector #info')\r\n            .button({\r\n                mini: true,\r\n                icon: 'bars',\r\n                iconpos: 'notext'\r\n            })\r\n            .click(event => {\r\n                $('#infoPanel').panel('open');\r\n                // $('#infoPanel').panel({\r\n                //     // display: 'overlay',\r\n                //     animate: true,\r\n                // }).panel('open');\r\n            });\r\n\r\n\r\n        let apartmentHeader = $('week-selector #header')\r\n            .attr('value', localStorage.getItem('apartment') + ' ' + localStorage.getItem('name'))\r\n            .button({mini: true})\r\n            .click(event => {\r\n                localStorage.clear();\r\n                location.reload();\r\n            });\r\n\r\n        // let delay;\r\n        // apartmentHeader[0].addEventListener('mousedown', function (e) {\r\n        //     delay = setTimeout(() => {\r\n        //         console.log('press detected');\r\n        //         localStorage.clear();\r\n        //         location.reload();\r\n        //         }, 100);\r\n        // }, true);\r\n        // apartmentHeader[0].addEventListener('mouseup', function (e) {\r\n        //     clearTimeout(delay);\r\n        // });\r\n        // apartmentHeader[0].addEventListener('mouseout', function (e) {\r\n        //     clearTimeout(delay);\r\n        // });\r\n\r\n        $('.weekSelectButton').button({mini: true});\r\n\r\n        $('.weekSelectButton#previous').click(event => {\r\n            this.shiftDays(-7);\r\n            // $(this).trigger('setWeek', {weekNo: this.currentWeek, mondayDate: this.currentDate.getPreviousMonday()});\r\n            $(this).trigger('shiftWeekLeft');\r\n        });\r\n\r\n        $('.weekSelectButton#current')\r\n            .click(event => {\r\n                this.shiftDays(0);\r\n                // $(this).trigger('setWeek', {weekNo: this.currentWeek, mondayDate: this.currentDate.getPreviousMonday()});\r\n            })\r\n            .on('taphold', event => {\r\n                // $('#popupDatePicker').popup('open');\r\n                $('<div>')\r\n                    .datebox({mode:'calbox'})\r\n                    .bind('datebox', (event, passed) => {\r\n                        if ( passed.method === 'set' ) {\r\n                            console.log(passed);\r\n                        }\r\n                    })\r\n                    .datebox('open');\r\n                $('.ui-title').html('Datum');\r\n            });\r\n\r\n        $('.weekSelectButton#next').click(event => {\r\n            this.shiftDays(7);\r\n            $(this).trigger('shiftWeekRight');\r\n            // $(this).trigger('setWeek', {weekNo: this.currentWeek, mondayDate: this.currentDate.getPreviousMonday()});\r\n        });\r\n    }\r\n\r\n    setDate(date) {\r\n        this.currentDate = date;\r\n        this.currentWeek = this.currentDate.getWeek();\r\n        $(this).trigger('setWeek', {weekNo: this.currentWeek, mondayDate: this.currentDate.getPreviousMonday()});\r\n    }\r\n\r\n    shiftDays(nDays) {\r\n        if (nDays !== 0) this.currentDate.addDays(nDays);\r\n        else this.currentDate = new Date();\r\n        this.currentWeek = this.currentDate.getWeek();\r\n        $(this).trigger('setWeek', {weekNo: this.currentWeek, mondayDate: this.currentDate.getPreviousMonday()});\r\n    }\r\n\r\n    enable(value) {\r\n        $('.weekSelectButton').prop(\"disabled\", !value);\r\n    }\r\n}\r\nwindow.customElements.define('week-selector', WeekSelector);\r\n\r\nclass WeekSchedule extends HTMLElement {\r\n\r\n    constructor() {\r\n        super();\r\n        let template = document.createElement('template');\r\n        template.innerHTML = `\r\n            <style>\r\n                #grid-container {\r\n                    position: relative;\r\n                    display: grid;\r\n                    grid-template-columns: repeat(8, 1fr);\r\n                    cursor: pointer;\r\n                }\r\n                .date-header-element {\r\n                    font-weight: bold;\r\n                    text-align: center;\r\n                    text-shadow: none;\r\n                    height: 40px;\r\n                }\r\n                .date-today {\r\n                    background-color: #d1d1dc !important;\r\n                }\r\n                .hour-item {\r\n                    font-weight: bold;\r\n                    text-align: center;\r\n                    border: 1px solid rgba(0, 0, 0, 0.3);\r\n                }\r\n                .date-element {\r\n                    color: black;\r\n                    font-size: 12px;\r\n                    word-spacing: -2px;\r\n                }\r\n                .slot-item {\r\n                    /*padding: 1px;*/\r\n                    background-color: #e9e9e9;\r\n                    border: 1px solid rgba(0, 0, 0, 0.3);\r\n                    border-radius: 3px;\r\n                    /*height: 20px;*/\r\n                    text-align: center;\r\n                    font-weight: bold;\r\n                    text-shadow: none;\r\n                }\r\n                #weekNumberElement {\r\n                    background-color: black;\r\n                    color: white;\r\n                    font-size: 16px;\r\n                    text-align: center;\r\n                    line-height: 40px;\r\n                    text-shadow: none;\r\n                }\r\n            </style>\r\n            <div id=\"grid-container\">\r\n        `;\r\n        // this.attachShadow({mode: 'open'}).appendChild(template.content.cloneNode(true));\r\n        this.appendChild(template.content.cloneNode(true));\r\n\r\n    }\r\n\r\n    connectedCallback() {\r\n        this.weekGrid = $('#grid-container')\r\n    }\r\n\r\n    slide(direction) {\r\n        let elementWidth = this.weekGrid.width();\r\n        let offsets = direction === 'right' ? [-elementWidth, elementWidth] : [elementWidth, -elementWidth];\r\n        $('#weekNumberElement').css({color: 'black'});\r\n        $('.date-element').css({color: 'white'});\r\n\r\n        this.weekGrid.animate({\r\n            left: offsets[0] + 'px'\r\n        },200, () => {\r\n            this.weekGrid.css({left: offsets[1] + 'px'});\r\n            this.weekGrid.animate({\r\n                left: \"0px\"\r\n            },200, () => {\r\n                $('#weekNumberElement').css({color: 'white'});\r\n                $('.date-element').css({color: 'black'});\r\n            })\r\n        });\r\n    }\r\n\r\n    setWeek(weekInfo) {\r\n\r\n        let setWeekTask = new $.Deferred();\r\n\r\n        let currentDate = new Date();\r\n\r\n        this.weekInfo = weekInfo;\r\n\r\n        console.log('loading week', weekInfo);\r\n\r\n        let days = ['M', 'T', 'O', 'T', 'F', 'L', 'S'];\r\n        let months = ['jan', 'feb', 'mar', 'apr', 'maj', 'jun', 'jul', 'aug', 'sep', 'okt', 'nov', 'dec'];\r\n\r\n        this.weekGrid.html(\"\");\r\n        this.weekGrid\r\n            .append($(\"<div>\")\r\n            .attr('id', 'weekNumberElement')\r\n            .addClass('date-header-element')\r\n            .html('v.' + weekInfo.weekNo));\r\n\r\n        for (let day = 0; day <= 6; day++) {\r\n\r\n            console.log(weekInfo.mondayDate.getDayOffset(day).isSameDay(currentDate));\r\n\r\n            let dayElement = $('<div>')\r\n                .addClass('day-element')\r\n                .html(days[day]);\r\n            let dateElement = $('<div>')\r\n                .addClass('date-element')\r\n                // .html(weekInfo.mondayDate.getDayOffset(day).getDate() + \"/\"+ (weekInfo.mondayDate.getDayOffset(day).getMonth() + 1));\r\n                .html(weekInfo.mondayDate.getDayOffset(day).getDate() + \" \"+ months[(weekInfo.mondayDate.getDayOffset(day).getMonth())]);\r\n\r\n            let dateHeaderElement = $('<div>').addClass('date-header-element').append(dayElement).append(dateElement);\r\n            // if (weekInfo.mondayDate.getDayOffset(day).isSameDay(currentDate)) dateHeaderElement.addClass('date-today');\r\n\r\n            this.weekGrid.append(dateHeaderElement);\r\n        }\r\n\r\n        for (let hour = 7; hour<=22; hour++) {\r\n            this.weekGrid.append($('<div>').addClass('hour-item').html(hour));\r\n\r\n            for (let day = 0; day <= 6; day++) {\r\n\r\n                let year = weekInfo.mondayDate.getDayOffset(day).getFullYear();\r\n                let month = weekInfo.mondayDate.getDayOffset(day).getMonth() + 1;\r\n                let date = weekInfo.mondayDate.getDayOffset(day).getDate();\r\n\r\n                let slotContainer = $('<div>')\r\n                    .addClass('slot-item')\r\n                    .attr('id', year + '_' + month + '_' + date + '_' + hour)\r\n                    .data({\r\n                        apartment: localStorage.getItem('apartment'),\r\n                        year: year,\r\n                        month: month,\r\n                        day: date,\r\n                        hour: hour,\r\n                        identifier: year + '' + month + '' + date + '' + hour\r\n                    })\r\n                    .click(function() {\r\n                        console.log(Object.keys(myBookings).length);\r\n                        if ($(this).children().length === 0 && isValidBooking($(this).data())) {\r\n                            $(this).append(new Booking($(this).data(), true));\r\n                        }\r\n                        // else {\r\n                        //     let booking = $(this).children('hour-booking');\r\n                        //     if (booking[0].data.apartment === localStorage.getItem('apartment')) {\r\n                        //         booking[0].delete();\r\n                        //     }\r\n                        //     else {\r\n                        //         //TODO ...\r\n                        //         // alert(booking[0].data.apartment)\r\n                        //     }\r\n                        // }\r\n                    })\r\n                    .appendTo(this.weekGrid);\r\n\r\n                if (weekInfo.mondayDate.getDayOffset(day).isSameDay(currentDate)) slotContainer.addClass('date-today');\r\n\r\n            }\r\n        }\r\n\r\n        $.when(getBookings()).done(data => {\r\n            data.forEach(d => {\r\n                let slotElement = this.weekGrid.children('#' + d.year + '_' + d.month + '_' + d.day + '_' + d.hour);\r\n                if (slotElement.length > 0) {\r\n                    // console.log(slotElement);\r\n                    slotElement.append(new Booking(d, false));\r\n                }\r\n            });\r\n            setWeekTask.resolve();\r\n        });\r\n\r\n        return setWeekTask;\r\n    }\r\n\r\n    reload() {\r\n        this.setWeek(this.weekInfo);\r\n    }\r\n}\r\nwindow.customElements.define('week-schedule', WeekSchedule);\r\n\r\nclass Booking extends HTMLElement {\r\n\r\n    constructor(data, doFetch) {\r\n        super();\r\n\r\n        this.data = data;\r\n        this.doFetch = doFetch;\r\n        this.bookingName = \"slot_\" +\r\n            data.apartment + \"_\" +\r\n            data.year + \"_\" +\r\n            data.month + \"_\" +\r\n            data.day + \"_\" +\r\n            data.hour + \"_\" +\r\n            data.identifier + \"_\" +\r\n            'lgh' + data.apartment;\r\n\r\n        let template = document.createElement('template');\r\n        template.innerHTML = `\r\n            <style>\r\n                #booking-container {\r\n                    line-height: 20px;\r\n                    font-size: 14px;\r\n                    width: 100%;\r\n                    height: 100%;\r\n                    border-radius: 10px;\r\n                }\r\n                .my-booking {\r\n                    background-color: green;\r\n                    color: white;\r\n                }\r\n                .other-booking {\r\n                    background-color: #ad0000;\r\n                    color: white;\r\n                }\r\n            </style>\r\n            <div id=\"booking-container\">\r\n        `;\r\n        // this.attachShadow({mode: 'open'}).appendChild(template.content.cloneNode(true));\r\n        this.appendChild(template.content.cloneNode(true));\r\n    }\r\n\r\n    connectedCallback() {\r\n\r\n        let bookingText = this.doFetch ? '...' : this.data.apartment;\r\n        let bookingClass = this.data.apartment === localStorage.getItem('apartment') ? 'my-booking' : 'other-booking';\r\n\r\n        this.container = $(this).children('#booking-container')\r\n            .html(bookingText)\r\n            .addClass(bookingClass);\r\n\r\n        this.container.on('click', event => {\r\n            console.log('BOOKING CLICKED', this.data.apartment, localStorage.getItem('apartment'));\r\n            if (this.data.apartment === localStorage.getItem('apartment') || localStorage.getItem('apartment') == 122) {\r\n                this.delete();\r\n            }\r\n            else {\r\n                //TODO ...\r\n                // $('#popupBasic').popup('open');\r\n            }\r\n        });\r\n\r\n        if (this.data.apartment === localStorage.getItem('apartment')) {\r\n            myBookings[this.data.identifier] = this;\r\n            console.log(myBookings);\r\n        }\r\n\r\n        if (!this.doFetch) return;\r\n\r\n        let searchPromises = [\r\n            dropbox.filesSearch({path: '', query: this.data.identifier}),\r\n            // dropbox.filesSearch({path: '', query: 'lgh' + this.data.apartment})\r\n        ];\r\n\r\n        Promise.all(searchPromises).then(data => {\r\n            console.log('found', data[0].matches);\r\n            // console.log('found', data[1].matches);\r\n            if (data[0].matches.length === 0) {\r\n                dropbox.filesUpload({path: \"/\" + this.bookingName, contents: \"content\"}).then(() => {\r\n                    this.container\r\n                        .html(this.data.apartment);\r\n\r\n                    console.log('booking created');\r\n\r\n                }, () => {console.log('an error occured');})\r\n            }\r\n            else {\r\n                console.log(\"slot is taken\");\r\n                $(this).remove();\r\n                weekSchedule[0].reload();\r\n                alert('tiden har bokats av någon annan efter att du gick in på sidan');\r\n            }\r\n        });\r\n    }\r\n\r\n    delete() {\r\n        this.container\r\n            .html('...');\r\n        dropbox.filesDelete({path: \"/\" + this.bookingName})\r\n            .then(() =>  {\r\n                console.log('booking deleted');\r\n                $(this).remove();\r\n                delete myBookings[this.data.identifier];\r\n                console.log(myBookings);\r\n            }, () => {console.log('an error occured');})\r\n    }\r\n\r\n}\r\nwindow.customElements.define('hour-booking', Booking);\r\n\r\n\r\nlet loadApp = function(){\r\n\r\n    dropbox = new Dropbox.Dropbox({\r\n        fetch: fetch,\r\n        accessToken: localStorage.getItem('dbtoken')\r\n    });\r\n\r\n    let content = $('#content');\r\n    content.html('');\r\n\r\n    weekSelector = $(new WeekSelector());\r\n    weekSchedule = $(new WeekSchedule())\r\n        .on('swipeleft', event => {\r\n            weekSelector[0].shiftDays(7);\r\n            weekSchedule[0].slide('right');\r\n        })\r\n        .on('swiperight', event => {\r\n            weekSelector[0].shiftDays(-7);\r\n            weekSchedule[0].slide('left');\r\n        });\r\n\r\n        weekSelector.on('shiftWeekLeft', () => {\r\n            weekSchedule[0].slide('left');\r\n        });\r\n        weekSelector.on('shiftWeekRight', () => {\r\n            weekSchedule[0].slide('right');\r\n        });\r\n\r\n        weekSelector.on('setWeek', (event, weekInfo) => {\r\n            weekSelector[0].enable(false);\r\n            $.when(weekSchedule[0].setWeek(weekInfo)).done(() => {\r\n                weekSelector[0].enable(true);\r\n        });\r\n    });\r\n\r\n    content.append(weekSelector);\r\n    content.append(weekSchedule);\r\n\r\n    weekSelector[0].setDate((new Date()))\r\n\r\n};\r\n\r\nlet accessToken = \"U2FsdGVkX189p19Ob4DSM/9t8eIFgKOYYEKDM4ekNsC4VsMFP3pxSm7jPgao6UTwe89bkrrd2zgL+d0sISLA6jW7nc+7HUpUHw8YRxMeqPAsLGHpenmbNddMIYwNlB5N\";\r\n\r\nlet fetchApartmentInfo = function(password){\r\n    let fetchTask = new $.Deferred();\r\n    $.get('/assets/enc/data.json.enc', data => {\r\n        try {\r\n            fetchTask.resolve(JSON.parse(CryptoJS.AES.decrypt(data, password).toString(CryptoJS.enc.Utf8)));\r\n        }\r\n        catch(e) {\r\n            // alert('hej');\r\n            fetchTask.resolve(null);\r\n        }\r\n    }, 'text');\r\n    return fetchTask;\r\n};\r\n\r\nlet loadApartments = function(password) {\r\n\r\n    $.when(fetchApartmentInfo(password)).done(apartmentInfo => {\r\n\r\n        if (apartmentInfo != null) {\r\n\r\n            $('#apartmentList').html('<p>Välj din lägenhet i listan.</p>');\r\n\r\n            $('#password').addClass('password-valid');\r\n\r\n            hideKeyboard($('#password'));\r\n\r\n            // hideKeyboard($(this));\r\n\r\n            Object.entries(apartmentInfo.apartments).map(([apartmentNumber, name]) => {\r\n                console.log(apartmentNumber, name);\r\n\r\n                $('<input type=\"button\">')\r\n                    .attr('value', apartmentNumber + '. ' + name)\r\n                    .appendTo($('#apartmentList'))\r\n                    .button({mini: true}).button('refresh')\r\n                    .click(event => {\r\n                        console.log('selecting', apartmentNumber + '. ' + name);\r\n\r\n                        localStorage.setItem('apartment', apartmentNumber);\r\n                        localStorage.setItem('name', name);\r\n                        localStorage.setItem('dbtoken', CryptoJS.AES.decrypt(accessToken, password).toString(CryptoJS.enc.Utf8));\r\n                        localStorage.setItem('version', version);\r\n\r\n                        console.log(localStorage);\r\n\r\n                        loadApp();\r\n                    })\r\n                    .parent().each((index,item) => {\r\n                        $(item).addClass('apartment-selector');\r\n                    });\r\n            });\r\n        }\r\n        else {\r\n            $('#password').addClass('password-invalid');\r\n        }\r\n    });\r\n};\r\n\r\n$(document).ready(function(){\r\n    if (localStorage.getItem('version') !== null) {\r\n        if (Number.parseInt(localStorage.getItem('version')) >= version) {\r\n            loadApp();\r\n        }\r\n    }\r\n    else {\r\n        // $('#password').focus().click();\r\n        // let password = CryptoJS.SHA256('password').toString();\r\n        // loadApartments(password);\r\n    }\r\n\r\n});\r\n\r\n$('#password').on('keyup',function(event) {\r\n    $('#password').removeClass('password-valid');\r\n    $('#password').removeClass('password-invalid');\r\n    $('#apartmentList').html('');\r\n    if ($(this).val().length === 4) {\r\n        let password = CryptoJS.SHA256($(this).val()).toString();\r\n        loadApartments(password);\r\n    }\r\n    else if (($(this).val().length > 4)) {\r\n        $('#password').addClass('password-invalid');\r\n    }\r\n\r\n\r\n});\n\n//# sourceURL=webpack:///./app.js?");

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module can't be inlined because the eval devtool is used.
/******/ 	var __webpack_exports__ = {};
/******/ 	__webpack_modules__["./app.js"]();
/******/ 	
/******/ })()
;