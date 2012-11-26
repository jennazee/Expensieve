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

	template: _.template("<td class='name-box'><p class='name'></p> <input class='name-edit' type='text' /><img class='hidden' src='static/pencil-icon.png' /></td>   <td class='amt-box'><p class='amount'></p><input class='amount-edit' type='number' /><img class='hidden' src='static/pencil-icon.png' /></td>   <td class='shares-box'> </td>   <td class='delcell'><span class='delete'> x </span></td>"),
	whoShareTextTemp: _.template("<p class='whoShared'></p>"),
	whoShareInputTemp: _.template("<input class='whoShared-edit' type='text' />"),
	amtShareTextTemp: _.template("<p class='amtShared'></p>"),
	amtShareInputTemp: _.template("<input class='amtShared-edit' type='text' />"),

	events: {
      	"click .name": "editWho",
      	"click .amount": "editAmt",
      	// "click .whoShared": "editWhoShared",
      	// "click .amtShared": "editAmtShared",

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
		var personPToAdd = this.whoShareTextTemp()
		var amtPToAdd = this.amtShareTextTemp()
		var personInputToAdd = this.whoShareInputTemp()
		var amtInputToAdd = this.amtShareInputTemp()

		$.each(shares, function(k,v){
			var personP = $(personPToAdd).text(k)
			var personInput = $(personInputToAdd).val(k)
			var amtP = $(amtPToAdd).text(v)
			var amtInput = $(amtInputToAdd).val(v)
			$(sBox).append('<div></div>')
			$(sBox).append(personP)
			$(sBox).append(personInput)
			$(sBox).append(amtP)
			$(sBox).append(amtInput)
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
    	$(this.el).children('td').children('img').removeClass('hidden');
    },

    unhover: function() {
    	$(this.el).children('td').children('img').addClass('hidden');
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

	// editWhoShared: function() {
	// 	$(this.el).children('.shares-box').children('.whoShared').addClass("shared-editing");
	// 	$(this.el).children('.shares-box').children('.whoShared-edit').addClass("shared-editing");
	// 	this.whoShareInput.focus();
	// },

	// editAmtShared: function() {
	// 	$(this.el).children('.shares-box').children('.amtShared').addClass("shared-editing");
	// 	$(this.el).children('.shares-box').children('.amtShared-edit').addClass("shared-editing");
	// 	this.amtShareInput.focus();
	// },
	
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
		this.model.save({'shares': this.gatherShares()[1]});
	},

	exitAmtShared: function() {
		var sharesTuple = this.gatherShares();
		if (sharesTuple[0]!== parseFloat(this.model.get('amount'))){
			alert("Your shares don't add up the total. Please adjust accordingly.")
		}
		else {
			$(this.el).children('.shares-box').children('.amtShared').removeClass("editing");
			$(this.el).children('.shares-box').children('.amtShared-edit').removeClass("editing");
			this.model.save({'shares': this.gatherShares()[1]});
		}
	},

	//helper method for gathering all the information that goes in a model's 'shares' object
	gatherShares: function(){
		var total=0;
		var shares = {};
		var targ = this.$('.shares-box');
		$.each(targ, function(el){
			var who = $(targ[el]).children('.whoShared-edit')
			var much = $(targ[el]).children('.amtShared-edit')
			for (g=0; g<who.length; g++){
				shares[$($(targ[el]).children('.whoShared-edit')[g]).val()] = $($(targ[el]).children('.amtShared-edit')[g]).val();
				total+=parseFloat($($(targ[el]).children('.amtShared-edit')[g]).val())
			}
		});
		return [total, shares];
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
        $('.expenseLine').each(function(i){
            if (i%2 === 0){
                $(this).addClass('evenbox');
            }
        })
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
        $('.expenseLine').each(function(i){
            if (i%2 === 0){
                $(this).addClass('evenbox');
            }
        })
    },
    
    addAll: function() {
        receipts.each(this.addOne);
        $('.expenseLine').each(function(i){
            if (i%2 === 0){
                $(this).addClass('evenbox');
            }
        })
    },

});

window.App = new AppView;

$(document).ready(function(){

	$('.who-shared').click(function(){
		$(this).addClass("shared-editing");
		$(this.el).children('.shares-box').children('.whoShared-edit').addClass("shared-editing");
		this.whoShareInput.focus();
	})

	// editAmtShared: function() {
	// 	$(this.el).children('.shares-box').children('.amtShared').addClass("shared-editing");
	// 	$(this.el).children('.shares-box').children('.amtShared-edit').addClass("shared-editing");
	// 	this.amtShareInput.focus();
	// },

	$('#send').click(function(){
    	var shares = {};
    	var total = 0;
    	for (i=0; i<$('.new-share').length; i++){
    		total+=parseFloat($($('.share')[i]).val())
    		shares[$($('.new-share')[i]).val()]= parseFloat($($('.share')[i]).val());
    	}

    	var amt = eval($('#new-amount').val())

    	total = Math.round(total*Math.pow(10,2))/Math.pow(10,2);

    	if (total === amt){
		  	receipts.create({
		    	'name': $('#new-name').val(),
		    	'amount': amt,
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

	$('#new-amount').blur(function(){
		$(this).val(eval($(this).val()))
	})

	//determines who owes each other what in the end
	$('#sift').click(function(){
        var debts = {}

        receipts.each(function(entry){
            var payer = entry.get('name');
            var shares = entry.get('shares');

            //for each share of the receipt
            $.each(shares, function(key, val){
                var ower = key
                var owed = val

                if (!debts[payer]){
                    debts[payer] = {} 
                }
                if (payer !== ower) {
                    if (debts[payer][ower]){
                        if (debts[payer][ower] > owed) {
                            debts[payer][ower] = debts[payer][ower] - owed
                        }
                        else if (owed > debts[payer][ower]){
                            debts[ower][payer] = owed - debts[payer][ower]
                            debts[payer][ower] = null
                        }
                        //perfectly resolved debt !!!
                        else {
                            debts[payer][ower] = null
                        }
                    }
                    else {
                        if (!debts[ower]){
                                debts[ower] = {}
                        }
                        if (!debts[ower][payer]){
                            debts[ower][payer] = 0
                        }
                        debts[ower][payer] = debts[ower][payer] + owed
                    }
                }
            })
        })
		$('#sifted').removeClass('hidden')
		$('#sifted').html('<h2>The Rundown</h2>')

        $.each(debts, function(ower, shares){
            $.each(shares, function(owed, amt){
                if (amt!==null){
                    $('#sifted').append('<p>' + ower + ' owes ' + owed + ' $' + amt + '</p>')
                }
            })
        })
		
    });

	$('#add-button').click(function(){
		$('#add').addClass('adding');
		$('#add-button').addClass('adding');

		$('#close-add').click(function(){
			$('#add').removeClass('adding');
			$('#add-button').removeClass('adding');
		})

		//splits the remaining total equally among all the sharers
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