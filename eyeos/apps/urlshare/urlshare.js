
function urlshare_application(checknum, pid, args) {
	var app = new eyeos.application.urlshare(checknum, pid, args);

}

qx.Class.define("eyeos.application.urlshare", {
	extend: eyeos.system.EyeApplication,

	construct: function(checknum, pid, args) {
            arguments.callee.base.call(this, "urlshare", checknum, pid);

            this._checknum = checknum;
            this._drawGui();

            this._isnew = args[1];
            if (this._isnew) {
                this._url = args[0];
            } else {
                this._id = args[0];
                eyeos.callMessage(this.getChecknum(), '__UrlShare_getUrlInfo', {urlId: this._id}, function (urlinfo){
                this._urlInfo = urlinfo;

                // protected with password?
                if (this._urlInfo.urlInformation.password == '') {
                    this.__rbnopass.setValue(true);
                } else {
                    this.__txtpass.setValue(this._urlInfo.urlInformation.password);
                    this.__txtrepeatpass.setValue(this._urlInfo.urlInformation.password);
                }
                // expiration date?
                if (this._urlInfo.urlInformation.expirationDate == this._onejan2070) {
                    this.__rbnocal.setValue(true);
                } else {

                    var expdate = this._urlInfo.urlInformation.expirationDate;

                    expdate = new Date(expdate * 1000);

                    this.__dccalendar.setValue(expdate);
                }
            }, this);
        }
	},

	members: {
        _checknum: null,
        _isnew: null,
        _url: null,
        _id: null,
        _urlInfo: null,
        _onejan2070: '2147483647',

        __window: null,
            __PassContainer: null,
                __PassTextContainer: null,
                __PassDataContainer: null,
                    __rbnopass: null,
                    __rbyespass: null,
                    __txtpass: null,
                    __txtrepeatpass: null,
            __DateContainer: null,
                __ExpirationTextContainer: null,
                __ExpirationDataContainer: null,
                    __YesNoContainer: null,
                        __rbnocal: null,
                        __rbyescal: null,
                    __CalendarContainer: null,
                        __dccalendar: null,
            __buttonsContainer: null,
                __bttcancel: null,
                __bttnext: null,
            _txturl: null,
            __buttonsContainer2: null,
                __CopySendContainer: null,
                    __bttcopy: null,
                    __bttsend: null,
                __DoneContainer: null,
                    __bttdone: null,

        _drawGui: function () {
            this.__window = new eyeos.ui.Window(this, tr('Share by URL'), 'index.php?extern=images/16x16/categories/applications-internet.png');

            this.__window.set({
				layout: new qx.ui.layout.VBox(),
				contentPadding: 15,
				width: 370,
				height: 310
			});

            this._createPassContainer();
            this._createDateContainer();
            this._createButtonsContainer();

            this.__window.open();
        },

        _createPassContainer: function () {

            this.__PassContainer = new qx.ui.container.Composite().set({
				layout: new qx.ui.layout.VBox()
			});

            // Text protect by password
            this.__PassTextContainer = new qx.ui.container.Composite().set({
				layout: new qx.ui.layout.HBox()
			});
            var lblpasstxt = new qx.ui.basic.Label(tr('Protect by password?'));
            this.__PassTextContainer.add(lblpasstxt);
            this.__PassContainer.add(this.__PassTextContainer);

            // password radiobuttons and textbox
            this.__PassDataContainer = new qx.ui.container.Composite().set({
			});
            var layoutpassdata = new qx.ui.layout.Grid();
            layoutpassdata.setSpacingX(20);
            layoutpassdata.setColumnWidth(0,110);

            this.__PassDataContainer.setLayout(layoutpassdata);
            this.__PassDataContainer.add(new qx.ui.basic.Label(tr('Password')), {row: 0, column: 1});
            this.__PassDataContainer.add(new qx.ui.basic.Label(tr('Repeat password')), {row: 0, column: 2});

            var rbgroupyesnopass = new qx.ui.form.RadioButtonGroup();
            rbgroupyesnopass.setLayout(new qx.ui.layout.HBox(5));

            this.__rbnopass = new qx.ui.form.RadioButton(tr('No'));
            this.__rbyespass = new qx.ui.form.RadioButton(tr('Yes'));

            this.__rbyespass.setValue(true);

            rbgroupyesnopass.add(this.__rbnopass);
            rbgroupyesnopass.add(this.__rbyespass);

            rbgroupyesnopass.addListener('changeSelection', function (e) {
                var buttonSelected = e.getData()[0];
				if (this.__rbnopass == buttonSelected) {
                    this.__txtpass.setEnabled(false);
                    this.__txtrepeatpass.setEnabled(false);
                } else if (this.__rbyespass == buttonSelected)  {
                    this.__txtpass.setEnabled(true);
                    this.__txtrepeatpass.setEnabled(true);
                }
			}, this);

            this.__PassDataContainer.add(rbgroupyesnopass, {row: 1, column: 0});

            this.__txtpass = new qx.ui.form.PasswordField();
            this.__txtpass.setMaxLength(8);
            this.__txtrepeatpass = new qx.ui.form.PasswordField();
            this.__txtrepeatpass.setMaxLength(8);

            this.__PassDataContainer.add(this.__txtpass, {row: 1, column: 1});
            this.__PassDataContainer.add(this.__txtrepeatpass, {row: 1, column: 2});

            this.__PassContainer.add(this.__PassDataContainer);

            this.__window.add(this.__PassContainer);

        },

        _createDateContainer: function () {

            this.__DateContainer = new qx.ui.container.Composite().set({
				layout: new qx.ui.layout.VBox(),
                height: 200
			});

            // Text Expiration date
            this.__ExpirationTextContainer = new qx.ui.container.Composite().set({
				layout: new qx.ui.layout.VBox().set({alignY: 'middle'}),
                height: 30
			});
            var lblexpirationtxt = new qx.ui.basic.Label(tr('Expiration date?'));
            this.__ExpirationTextContainer.add(lblexpirationtxt);
            this.__DateContainer.add(this.__ExpirationTextContainer);


            // yes-no radiobuttons and calendar
            this.__ExpirationDataContainer = new qx.ui.container.Composite().set({
				layout: new qx.ui.layout.HBox()
			});

            this.__YesNoContainer = new qx.ui.container.Composite().set({
				layout: new qx.ui.layout.VBox().set({alignY: 'top'})
			});

            var rbgroupyesnocalendar = new qx.ui.form.RadioButtonGroup();
            rbgroupyesnocalendar.setLayout(new qx.ui.layout.HBox(5).set({alignY: 'top'}));

            this.__rbnocal = new qx.ui.form.RadioButton(tr('No'));
            this.__rbyescal = new qx.ui.form.RadioButton(tr('Yes'));

            this.__rbyescal.setValue(true);

            rbgroupyesnocalendar.add(this.__rbnocal);
            rbgroupyesnocalendar.add(this.__rbyescal);

            rbgroupyesnocalendar.addListener('changeSelection', function (e) {
                var buttonSelected = e.getData()[0];
				if (this.__rbnocal == buttonSelected) {
                    this.__dccalendar.setEnabled(false);
                } else if (this.__rbyescal == buttonSelected)  {
                    this.__dccalendar.setEnabled(true);
                }
			}, this);

            this.__YesNoContainer.add(rbgroupyesnocalendar);

            this.__CalendarContainer = new qx.ui.container.Composite().set({
				layout: new qx.ui.layout.HBox().set({alignX: 'left'})
			});

            this.__dccalendar = new qx.ui.control.DateChooser();

            this.__CalendarContainer.add(this.__dccalendar);

            this.__ExpirationDataContainer.add(this.__YesNoContainer, {width: '40%'});
            this.__ExpirationDataContainer.add(this.__CalendarContainer, {width: '60%'});

            this.__DateContainer.add(this.__ExpirationDataContainer);
            this.__window.add(this.__DateContainer);
        },

        _createButtonsContainer: function () {

            this.__buttonsContainer = new qx.ui.container.Composite().set({
				layout: new qx.ui.layout.HBox().set({spacing: 240})
			});

            this.__bttcancel =  new qx.ui.form.Button(tr('Cancel'));
            this.__bttnext =  new qx.ui.form.Button(tr('Next'));

            this.__bttnext.addListener('execute', this._nextWindow, this);
            this.__bttcancel.addListener('execute', this._cancel, this);

            this.__buttonsContainer.add(this.__bttcancel);
            this.__buttonsContainer.add(this.__bttnext);

            this.__window.add(this.__buttonsContainer);

        },

        _nextWindow: function () {
            var error = '';
            var errormsg = '';
            // Checking input errors
            if (this.__rbyespass.getValue() == true) {
                // Checking if password is empty
                if (this.__txtpass.getValue() == '' || this.__txtpass.getValue() == null || this.__txtrepeatpass.getValue() == '' || this.__txtrepeatpass.getValue() == null) {
                    error = tr('Empty password');
                    errormsg = tr('The password is empty');
                }
                // Checking if the two pass match
                else if (this.__txtpass.getValue() != this.__txtrepeatpass.getValue()) {
                    error = tr('Password not match');
                    errormsg = tr('The two password entered does not match.');
                }
            }
            if (error == '' && this.__rbyescal.getValue() == true) {
                var expidate = this.__dccalendar.getValue();

                var todaydate = new Date();
                todaydate = todaydate.getTime();

                if (expidate == null) {
                    error = tr('Undefined date');
                    errormsg = tr('Please select a expiration date.');    
                }
                // Checking if selected date is previous to actual date
                else {
                    // this is to set time of expiration to the end of the day
                    expidate.setHours(23,59,59,000);
                    expidate = expidate.getTime();

                    if (expidate < todaydate) {
                    error = tr('Date expired');
                    errormsg = tr('The selected expiration date is earlier than current date');
                    }
                }
            }

            if (error != '') {
                var optionPane = new eyeos.dialogs.OptionPane(
							errormsg,
								eyeos.dialogs.OptionPane.ERROR_MESSAGE,
								eyeos.dialogs.OptionPane.DEFAULT_OPTION);
                var dialog = optionPane.createDialog(this.__window, error, function(result) {},false);
				dialog.open();
            // Free of input errors
            } else {
                // NEW
                if (this._isnew == true) {
                    eyeos.callMessage(this.getChecknum(), '__UrlShare_createURL', {path: this._url}, function (createdurl){
                        if (this.__rbyespass.getValue() == true) {
                            createdurl.password = this.__txtpass.getValue();
                        } else {
                            createdurl.password = '';
                        }
                        if (this.__rbyescal.getValue() == true) {
                            var expiration = Math.round(this.__dccalendar.getValue().getTime()/1000);
                            createdurl.expirationDate = expiration;
//                            createdurl.expirationDate.toFixed();
                        } else {
                            createdurl.expirationDate = this._onejan2070;
                        }
                        eyeos.callMessage(this.getChecknum(), '__UrlShare_updateURL', {id: createdurl.id, password: createdurl.password, expirationDate: createdurl.expirationDate, enabled: createdurl.enabled}, function (){

                            eyeos.callMessage(this.getChecknum(), '__UrlShare_getUrlInfo', {urlId: createdurl.id}, function (urlinfo){
                                this._urlInfo = urlinfo;
                                this._drawSecondWindow();
                                this._txturl.setValue(urlinfo.urlInformation.name);
                            }, this);

                        }, this);
                    }, this);
                // MODIFING
                } else {
                    if (this.__rbyespass.getValue() == true) {
                        this._urlInfo.urlInformation.password = this.__txtpass.getValue();
                    } else {
                        this._urlInfo.urlInformation.password = '';
                    }
                    if (this.__rbyescal.getValue() == true) {
                        var expiration = Math.round(this.__dccalendar.getValue().getTime()/1000);
                        this._urlInfo.urlInformation.expirationDate = expiration;
//                        this._urlInfo.urlInformation.expirationDate.toFixed();
                    } else {
                        this._urlInfo.urlInformation.expirationDate = this._onejan2070;
                    }
                    eyeos.callMessage(this.getChecknum(), '__UrlShare_updateURL', {id: this._urlInfo.urlInformation.id, password: this._urlInfo.urlInformation.password, expirationDate: this._urlInfo.urlInformation.expirationDate, enabled: this._urlInfo.urlInformation.enabled}, function (){
                        this._drawSecondWindow();
                        this._txturl.setValue(this._urlInfo.urlInformation.name);
                    }, this);
                }
                
            }
        },

        _drawSecondWindow: function () {

            this.__window.removeAll();

            this.__window.setWidth(500);
            this.__window.setHeight(170);

            var lblyoururl = new qx.ui.basic.Label(tr('Here is your Url'));
            lblyoururl.setHeight(20);
            this._txturl = new qx.ui.form.TextField();
            var lblyoucancopy = new qx.ui.basic.Label(tr('You can copy this URL in your clipboard to use it wherever you need it.'));
            lblyoucancopy.setHeight(40);

            this.__buttonsContainer2 = new qx.ui.container.Composite().set({
				layout: new qx.ui.layout.HBox()
			});

            this.__CopySendContainer = new qx.ui.container.Composite().set({
				layout: new qx.ui.layout.HBox().set({alignX: 'right', spacing: 10})
			});
            this.__DoneContainer = new qx.ui.container.Composite().set({
				layout: new qx.ui.layout.HBox().set({alignX: 'right'})
			});

            this.__buttonsContainer2.add(this.__CopySendContainer, {width: '70%'});
            this.__buttonsContainer2.add(this.__DoneContainer, {width: '30%'});


            this.__bttcopy =  new qx.ui.form.Button(tr('Copy to clipboard'));
            this.__bttsend =  new qx.ui.form.Button(tr('Send by e-mail'));
            this.__bttdone =  new qx.ui.form.Button(tr('Done'));

//            this.__bttcopy.addListener('execute', this._nextWindow, this);
//            this.__bttsend.addListener('execute', this._nextWindow, this);
            this.__bttdone.addListener('execute', this._cancel, this);
            //TODO: Add this functionalities on the next release
            //this.__CopySendContainer.add(this.__bttcopy,{});
            //this.__CopySendContainer.add(this.__bttsend);
            this.__DoneContainer.add(this.__bttdone);

            this.__window.add(lblyoururl);
            this.__window.add(this._txturl);
            this.__window.add(lblyoucancopy);
            this.__window.add(this.__buttonsContainer2);
        },

        _cancel: function () {
			this.close();
		}
    }
});


