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

	template: _.template("<td class='name-box'><p class='name'></p> <input class='name-edit' type='text' /></td>   <td class='amt-box'><p class='amount'></p><input class='amount-edit' type='number' /></td>   <td class='shares-box'> </td>   <td class='delcell'><span class='delete'> x </span></td>"),
	whoShareTemp: _.template("<p class='whoShared'></p><input class='whoShared-edit' type='text' />"),
	amtShareTemp: _.template("<p class='amtShared'></p><input class='amtShared-edit' type='text' />"),

	events: {
      	"click .name": "editWho",
      	"click .amount": "editAmt",
      	"click .whoShared": "editWhoShared",
      	"click .amtShared": "editAmtShared",

      	"mouseover": 'hover',
      	"mouseout": 'unhover',

      	"click .delete": "clear",

      	"keypress .name-edit": "updateName",
      	"keypress .amount-edit": "updateAmt",
      	"keypress .whoShared-edit": "updateWhoShared",
      	"keypress .amtShared-edit": "updateAmtShared",

      	"blur .name-edit": 'exitName',
      	"blur .amount-edit": 'exitAmount',
      	"blur .whoShared-edit": 'exitWhoShared',
      	"blur .amtShared-edit": 'exitAmtShared',
	},

	initialize: function() {
      _.bindAll(this, 'render', 'exitName', 'exitAmount', 'exitWhoShared', 'exitAmtShared');
      this.model.bind('change', this.render);
      this.model.view = this;
    },

	setContent: function() {
		var name = this.model.get('name');
		var amount = this.model.get('amount');
		var shares = this.model.get('shares');

		this.$('.name').text(name);
		this.$('.name-edit').val(name)

		this.$('.amount').text(amount);
		this.$('.amount-edit').val(amount)

		var sBox = this.$('.shares-box')
		var pToAdd = this.whoShareTemp()
		var amtToAdd = this.amtShareTemp()

		$.each(shares, function(k,v){
			var person = $(pToAdd).text(k)
			var amt = $(amtToAdd).text(v)
			$(sBox).append(person)
			$(sBox).append(amt)
		})

		this.nameInput = this.$('.name-edit');
		this.amtInput = this.$('.amount-edit');
		this.whoShareInput = this.$('.whoShared-edit');
		this.amtShareInput = this.$('.amtShared-edit');
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
	
	//methods for editing the contents of the page when clicked
	editWho: function() {
		$(this.el).children('.name-box').addClass("editing");
		this.nameInput.focus();
	},

	editAmt: function() {
		$(this.el).children('.amt-box').addClass("editing");
		this.amtInput.focus();
	},

	editWhoShared: function() {
		console.log('click!')
		$(this.el).children('.shares-box').children('.whoShared').addClass(".shared-editing");
		$(this.el).children('.shares-box').children('.whoShared-edit').addClass(".shared-editing");
		this.whoShareInput.focus();
	},

	editAmtShared: function() {
		console.log('click!')
		$(this.el).children('.shares-box').children('.amtShared').addClass(".shared-editing");
		$(this.el).children('.shares-box').children('.amtShared-edit').addClass(".shared-editing");
		this.amtShareInput.focus();
	},
	
	//methods for saving the edited contents of the page
	exitName: function() {
		$(this.el).children('.name-box').removeClass("editing");
		this.model.save({'name': this.nameInput.val()});
	},

	exitAmount: function() {
		$(this.el).children('.amount-box').removeClass("editing");
		this.model.save({'amount': this.amtInput.val()});
	},

	exitWhoShared: function() {
		$(this.el).children('.shares-box').children('.whoShared').removeClass("editing");
		$(this.el).children('.shares-box').children('.whoShared-edit').removeClass("editing");
		this.model.save({'shares': this.gatherShares});
	},

	exitAmtShared: function() {
		$(this.el).children('.shares-box').children('.amtShared').removeClass("editing");
		$(this.el).children('.shares-box').children('.amtShared-edit').removeClass("editing");
		this.model.save({'shares': this.gatherShares});
	},

	//helper method for gathering all the information that goes in a model's 'shares' object
	gatherShares: function(){
		var shares = {}
		$.each(this.$('.shares-box'), function(el){
			shares[el.$('.whoShared-edit').val()] = el.$('.amtShared-edit').val()
		});
	},

	//methods for exiting edited content, delegating to save it
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

    updateWhoShared: function(e) {
		if (e.keyCode === 13){
      		this.exitWhoShared();
      	}
    },

    updateAmtShared: function(e) {
		if (e.keyCode === 13){
      		this.exitAmtShared();
      	}
    },

    //deletes an entry
    clear: function() {
    	this.model.remove();
    }
})

window.AppView = Backbone.View.extend({
	el: $('#wrapper'),

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
    	var shares = {};
    	var total = 0;
    	for (i=0; i<$('.new-share').length; i++){
    		total+=parseFloat($($('.share')[i]).val())
    		shares[$($('.new-share')[i]).val()]= parseFloat($($('.share')[i]).val());
    	}

    	total = Math.round(total*Math.pow(10,2))/Math.pow(10,2);

    	if (total === parseFloat($('#new-amount').val())){
		  	receipts.create({
		    	'name': $('#new-name').val(),
		    	'amount': $('#new-amount').val(),
		    	'shares': shares
		  	});
		    $('#new-name').val('');
		    $('#new-amount').val('');
		    $('.new-share').val('');
		    $('.share').val('');
		    $('.added').remove()
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

	$('#sift').click(function(){
    	console.log('click')
    	var owed = {}
    	console.log(receipts)
    	receipts.each(function(entry){
    		var name = entry.get('name');
			var amount = entry.get('amount');
			var shares = entry.get('shares');

			//if the person who paid doesn't already have a 'tab', open one
			if (!owed[name]){
				owed[name] = {} 
			}
			//for each share of the receipt
			$.each(shares, function(key, val){
				//disregard the person's share
				if (name !== key){
					//if the current person owes the current sharer money already
					if (owed[key]){
						if (owed[key][name]){
							//if the debt is higher than the current amount to be owed, just credit that amount to the existing 
							if (owed[key][name]>val){
								owed[key][name]-=val
							}
							//if the debt is lower than the current amount to be owed, adjust the current
							else if (owed[key][name]<val){
								owed[name][key] = val - owed[key][name]
							}
							//otherwise, they are equal. Yay!
							else {
								owed[key][name] = null
							}
						}
					}
					else if (owed[name][key]){
						owed[name][key]+=val
					}
					//no previous owing relationship
					else {
						owed[name][key] = val
					}
				}
			})
    	})
		$('#sifted').removeClass('hidden')
		$('#sifted').html('<h2>The Rundown</h2>')
		$.each(owed, function(paid, shares){
			$.each(shares, function(who, amt){
				$('#sifted').append('<p>' + who + ' owes ' + paid + ' $' + amt + '</p>')
			})
			
		})
		
    });

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