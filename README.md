#Expensieve
##Sift out shared expenses

###Why?
I built this because my housemates and I had a ever-expanding stack of receipts and bills that one of us payed that we all needed to have a share in.

### "Dependencies"
Uses: backbone.js, node.js with express.js, and jquery

###How does it work?
You make an account and then you have the ability to create "sheets," the tables in which you enter "receipts." Each receipt entails who paid, how much, who has a share in the expense, and how much. Once you have entered all your receipts, you can "sift out" who owes who what.

### Pages
0. Login page: Upon arriving to the site, you login or make a new account. Doing that successfully takes you to...
1. Account page: Lists a user's name, email address, and 'sheets' they are involved in
2. Sheet pages: Lists shared "receipts" (expenses) and allows you to ultimately "sift out" who owes who what