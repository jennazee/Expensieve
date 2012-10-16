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
    	this.model.remove();
    }
})

window.AppView = Backbone.View.extend({
	el: $('#wrapper'),

	events: {
		'click #sort' : 'sortItOut'
	},

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

    sortItOut: function() {
    	console.log('click')
    	var owed = {}
    	_.each(function(receipts, el){
    		console.log(el)
    		var name = el.model.get('name');
			var amount = el.model.get('amount');
			var shared = el.model.get('shared');
			var shares = el.model.get('shares');

			if (!owed.name){
				owed[name] = {} 
			}
			for (i=0; i<shared.length; i++){
				if (name!==shared[i]){
					if (owed[name][shared[i]]){
						owed[name][shared[i]]+=shares[i]
					}
					else {
						owed[name][shared[i]]=shares[i]
					}	
				}
			}
    	})
    	console.log(owed)
    }

    addOne: function(item) {
      	var element = new ReceiptView({model: item}).render().el;
      	$("#expense-list").append(element);
    },
    
    addAll: function() {
      receipts.each(this.addOne);
    },

});

window.App = new AppView;

$(document).ready(function(){


	$('#send').click(function(){
    	var shared = [];
    	var shares = [];
    	var total = 0;
    	for (i=0; i<$('.new-share').length; i++){
    		total+=parseFloat($($('.share')[i]).val())
    		shares.push(parseFloat($($('.share')[i]).val()));
    		shared.push($($('.new-share')[i]).val());
    	}

    	total = Math.round(total*Math.pow(10,2))/Math.pow(10,2);

    	if (total === parseFloat($('#new-amount').val())){
		  	receipts.create({
		    	'name': $('#new-name').val(),
		    	'amount': $('#new-amount').val(),
		    	'shared': shared,
		    	'shares': shares
		  	});
		    $('#new-name').val('');
		    $('#new-amount').val('');
		    $('.new-share').val('');
		    $('.share').val('');
		    $('#add-button').removeClass('adding');
		    $('#add').removeClass('adding');
		}
		else if (total < $('#new-amount').val()){
			alert("You haven't quite covered the total.")
		}
		else {
			alert("The sum of the splits is greater than the amount paid.")
		}
	});

	// $('#sort').click(function(){
 //    	console.log('click')
 //    	var owed = {}
 //    	_.each(function(receipts, el){
 //    		console.log(el)
 //    		var name = el.model.get('name');
	// 		var amount = el.model.get('amount');
	// 		var shared = el.model.get('shared');
	// 		var shares = el.model.get('shares');

	// 		if (!owed.name){
	// 			owed[name] = {} 
	// 		}
	// 		for (i=0; i<shared.length; i++){
	// 			if (name!==shared[i]){
	// 				if (owed[name][shared[i]]){
	// 					owed[name][shared[i]]+=shares[i]
	// 				}
	// 				else {
	// 					owed[name][shared[i]]=shares[i]
	// 				}	
	// 			}
	// 		}
 //    	})
 //    	console.log(owed)
 //    });

	$('#add-button').click(function(){
		$('#add').addClass('adding');
		$('#add-button').addClass('adding');

		$('#splitEqual').click(function(){
			var numSplit = 0;
			var amount = parseFloat($('#new-amount').val());
			var amtAlloc = 0;

			for (i=0; i<$('.new-share').length; i++){
				if ($($('.share')[i]).val()!== ''){
					amtAlloc+=parseFloat($($('.share')[i]).val())
				}
				else {
					numSplit++;
				}
			}
			var total = amtAlloc;
			var split = Math.round((amount-amtAlloc)/numSplit*Math.pow(10,2))/Math.pow(10,2);

			//difference between the total created by just splitting and the real total
			// if negative, i need to nudge some of the splits down
			// if positive, i need to nudge some of the splits up
			var dis = Math.round((amount - (split * numSplit + amtAlloc))*Math.pow(10,2))/Math.pow(10,2)

			for (i=0; i<$('.new-share').length; i++){
				if ($($('.share')[i]).val()=== ''){
					if (dis < 0){
						$($('.share')[i]).val(split-0.01);
						dis = Math.round((dis+0.01)*Math.pow(10,2))/Math.pow(10,2)
					}
					else if (dis > 0) {
						$($('.share')[i]).val(split+0.01);
						dis = Math.round((dis-0.01)*Math.pow(10,2))/Math.pow(10,2)
					}
					else {
						$($('.share')[i]).val(split);
					}
				}
			}
		});
	});

	$('.add-share').click(function(){
		$("<div class='added'> <input class='new-share' type='text'/> <span>$</span><input type='number' class='share' /><span class='delete-add'> x </span></div>").insertAfter('.add-share')
		
		$('.delete-add').click(function(){
			$(this).parent().remove()
		})
	})
});