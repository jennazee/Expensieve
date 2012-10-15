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

window.receipts = new ReceiptList;

window.ReceiptView = Backbone.View.extend({
	tagName: 'tr',
	className: 'expenseLine',
	model: Receipt,

	template: _.template("<td class='name-box'><p class='name'></p> <input class='name-edit' type='text' /></td>   <td class='amt-box'><p class='amount'></p><input class='amount-edit' type='number' /></td>   <td class='shared-box'><p class='shared'></p><input class='shared-edit' type='text' /></td>   <td class='delcell'><span class='delete'> x </span></td>"),

	events: {
      	"click .name": "editWho",
      	"click .amount": "editAmt",
      	"click .shared": "editShared",

      	"mouseover": 'hover',
      	"mouseout": 'unhover',

      	"click .delete": "clear",

      	"keypress .name-edit": "updateName",
      	"keypress .amount-edit": "updateAmt",
      	"keypress .shared-edit": "updateShared",

      	"blur .name-edit": 'exitName',
      	"blur .amount-edit": 'exitAmount',
      	"blur .shared-edit": 'exitShared',
	},

	initialize: function() {
      _.bindAll(this, 'render', 'exitName', 'exitAmount', 'exitShared');
      this.model.bind('change', this.render);
      this.model.view = this;
      this.category = this.model.get('category');
    },

	setContent: function() {
		var name = this.model.get('name');
		var amount = this.model.get('amount');
		var shared = this.model.get('shared');

		this.$('.name').text(name);
		this.$('.name-edit').val(name)

		this.$('.amount').text(amount);
		this.$('.amount-edit').val(amount)

		this.$('.shared').text(shared);
		this.$('.shared-edit').val(shared)

		this.nameInput = this.$('.name-edit');
		this.amtInput = this.$('.amount-edit');
		this.shareInput = this.$('.shared-edit');
	},
  
    render: function() {
     	$(this.el).html(this.template());
      	this.setContent();
      	return this;
    },

    hover: function() {
    	$(this.el).addClass('hovered');
    },

    unhover: function() {
    	$(this.el).removeClass('hovered');
    },
	
	editWho: function() {
		$(this.el).children('.name-box').addClass("editing");
		this.nameInput.focus();
	},

	editAmt: function() {
		$(this.el).children('.amt-box').addClass("editing");
		this.amtInput.focus();
	},

	editShared: function() {
		$(this.el).children('.shared-box').addClass("editing");
		this.shareInput.focus();
	},
	
	exitName: function() {
		$(this.el).children('.name-box').removeClass("editing");
		this.model.save({'name': this.nameInput.val()});
	},

	exitAmount: function() {
		$(this.el).children('.amount-box').removeClass("editing");
		this.model.save({'amount': this.amtInput.val()});
	},

	exitShared: function() {
		$(this.el).children('.shared-box').removeClass("editing");
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

window.AppView = Backbone.View.extend({
	el: $('#wrapper'),

	// events: {
 //      "click #send" : "addToDB",
 //      "click #add-button" : "showAdd"
 //    },

    initialize: function() {
    	_.bindAll(this, 'addOne', 'addAll', 'render');
    
      	this.news = this.$("#add");
      
      	receipts.bind('add', this.addOne);
      	receipts.bind('refresh', this.addAll);
      	receipts.bind('all', this.render);
    
      	receipts.fetch(
      		{success: this.addAll}
      	);
    },

    addOne: function(item) {
      	var element = new ReceiptView({model:item}).render().el;
      	$("#expense-list").append(element);
    },
    
    addAll: function() {
      receipts.each(this.addOne);
    },

});

window.App = new AppView;

$(document).ready(function(){


$('#send').click(function(){
    	console.log('send')
	  	receipts.create({
	    	'name': $('#new-name').val(),
	    	'amount': $('#new-amount').val(),
	    	'shared': $('#new-share').val(),
	    	'shares': ['ummmm']
	  	});
	    $('#add').children('input').val('');
	    $('#add-button').removeClass('adding');
	    $('#add').removeClass('adding');
	});

	$('#add-button').click(function(){
		$('#add').addClass('adding');
		$('#add-button').addClass('adding');

		$('#splitEqual').click(function(){
			var numSplit = $('#new-share').val().split(',').length+1;
			var amount = $('#new-amount').val();
			var splits = [];
			var total = 0;
			for (i=0; i<numSplit; i++){
				split = Math.round(amount/numSplit*Math.pow(10,2))/Math.pow(10,2);
				splits.push(split)
				total = total + split
			}
		});
	});
});