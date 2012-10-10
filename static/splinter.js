window.Receipt = Backbone.Model.extend({
	idAttribute: '_id',
	urlRoot: '/receipts',

	remove: function(){
		this.destroy();
		$(this.view.el).remove();
	}
});

window.ReceiptList = Backbone.Collection.extend({
	model: Receipt,
	url: '/receipts'
});

window.ReceiptView = Backbone.View.extend({
	tagName: 'tr',
	className: 'expenseLine',
	model: Receipt,

	template: _.template("<p class='name'></p> <input class='name-edit' type='text' /> <p class='amount'></p><input class='amount-edit' type='number' /> <p class='shared'></p><input class='shared-edit' type='text' />"),

	events: {
      	"click .name": "editWho",
      	"click .amount": "editAmt",
      	"click .memo": "editShared",

      	"click .delete": "clear",

      	"keypress .name-edit": "updateName",
      	"keypress .amount-edit": "updateAmt",
      	"keypress .shared-edit": "updateShared",

      	"blur .name-edit": 'exitName',
      	"blur .amount-edit": 'exitAmount',
      	"blur .shared-edit": 'exitShared',
	},

	initialize: function() {
      _.bindAll(this, 'render', 'exit');
      this.model.bind('change', this.render);
      this.model.view = this;
      this.category = this.model.get('category');
    },

	setContent: function() {
		var name = this.model.get('name');
		var amount = this.model.get('amount');
		var shared = this.model.get('shared');

		this.$('.name').text(text);
		this.$('.name-edit').val(text)

		this.$('.amount').text(text);
		this.$('.amount-edit').val(text)

		this.nameInput = this.$('.name-edit');
		this.amtInput = this.$('.amount-edit');
		this.shareInput = this.$('.shared-edit');
	},
  
    render: function() {
     	$(this.el).html(this.template());
      	this.setContent();
      	return this;
    },

	
	editWho: function() {
		$(this.el).children('.name').addClass("editing");
		this.nameInput.focus();
	},

	editAmt: function() {
		$(this.el).children('.amount').addClass("editing");
		this.amtInput.focus();
	},

	editShared: function() {
		$(this.el).children('.shared').addClass("editing");
		this.shareInput.focus();
	},

	
	exitName: function() {
		$(this.el).children('.name').removeClass("editing");
		this.model.save({'name': this.nameInput.val()});
	},

	exitAmount: function() {
		$(this.el).children('.amount').removeClass("editing");
		this.model.save({'amount': this.amtInput.val()});
	},

	exitShared: function() {
		$(this.el).children('.shared').removeClass("editing");
		this.model.save({'shared': this.shareInput.val()});
	},

	updateName: function(e) {
		if (e.keyCode === 13){
      		this.exitName();
      	}
    },

    updateAmt: function(e) {
		if (e.keyCode === 13){
      		this.exitAmount();
      	}
    },

    updateShared: function(e) {
		if (e.keyCode === 13){
      		this.exitShared();
      	}
    },

    clear: function() {
    	console.log('delete')
    	this.model.remove();
    }
})