const express = require('express')
const mysql = require('mysql');

const router = express.Router()

const connection = mysql.createConnection({
    host     : 'localhost',
    user     : 'debian-sys-maint',
    password : 'ay3m0Lq7nqfY7PWY',
    database : 'budget_care'
});

var uname;
var upass;
var fname;
var monthlylimit;
var sum_transactions;
var remaining;
var exceeded;
var rows;
var d = new Date();            //current date (on the basis of system's date) object created
var n = d.getMonth() + 1;      //months are numbered from 0-11 so 1 is added to get proper month number
var flag1 = true;
var flag2 = true;

router.get("/",function(req,res){
    var message1 = "";
    if (flag1)
        res.render('front_page',{invalid_input1: message1});
    else{
        message1 = "Enter valid credentials!";
        res.render('front_page',{invalid_input1: message1});
    }
});

router.get("/signuppage",function(req,res){
    var message2 = "";
    if (flag2)
        res.render('sign_up_page',{invalid_input2: message2});
    else{
        message2 = "Username is already taken!";
        res.render('sign_up_page',{invalid_input2: message2});
    }
});

router.get("/rendertransactions",function(req,res){
    if (remaining < 0){
        exceeded = Math.abs(remaining);
        remaining = 0;
        res.render('update_transactions_page',{f_name: fname, m_limit: monthlylimit, m_remaining: remaining, m_exceeded: "You have exceeded this month's budget by Rs." +exceeded, s_transactions: sum_transactions, data: rows});
    }
    else{
        res.render('update_transactions_page',{f_name: fname, m_limit: monthlylimit, m_remaining: remaining, m_exceeded: "", s_transactions: sum_transactions, data: rows});
    }
});

router.post("/signup",function(req,res){
    res.redirect("/signuppage");
});

router.post("/update_monthly_limit",function(req,res){
    res.render("monthly_limit_page");
});

router.post("/signup/signingup",function(req,res){
    uname = req.body.new_username;
    upass = req.body.new_password;
    fname = req.body.new_first_name;
    var newlastname = req.body.new_last_name;
    monthlylimit = req.body.new_monthly_limit;
    var q3 = "INSERT INTO users(username,password,first_name,last_name,monthly_budget) values('"+uname+"','"+upass+"','"+fname+"','"+newlastname+"',"+monthlylimit+")";
    connection.query(q3,function(errors,results,fields){
        if (errors){
            flag2 = false;
            res.redirect("/signuppage");
        }
        else{
            flag2 = true;
            displayValues(res);
        }
    });
});
function displayValues(res){
    var q1 = "SELECT first_name AS firstname FROM users WHERE username='"+uname+"' AND password='"+upass+"'";
    connection.query(q1,function(errors,results,fields){
        if (errors) throw errors;
        if (results.length){
            flag1 = true;
            fname = results[0].firstname;   
            var q5 = "SELECT monthly_budget AS monthlimit FROM users WHERE username='"+uname+"' AND password='"+upass+"'";
            connection.query(q5,function(errors,results,fields){
                if (errors) throw errors;
                monthlylimit = results[0].monthlimit;
            });
            var q6 = "SELECT IFNULL(SUM(amount_spent),0) AS sumtransactions,MONTH(created_at) AS month_no FROM spendings GROUP BY users_name,month_no HAVING users_name='"+uname+"' AND month_no="+n;
            connection.query(q6,function(errors,results,fields){
                if (errors) throw errors;
                try{
                    sum_transactions = results[0].sumtransactions;
                }
                catch{
                    sum_transactions = 0;
                }
                remaining = monthlylimit - sum_transactions;
            });
            var q7 = "SELECT event,payment_method,amount_spent,created_at FROM spendings WHERE users_name='"+uname+"' ORDER BY created_at DESC LIMIT 10";
            connection.query(q7,function(errors,results,field){
                if (errors) throw errors;
                rows = results;
                res.redirect("/rendertransactions");
            });
        }
        else{
            flag1 = false;
            res.redirect("/");
        }
    });
    
}

router.post("/loggedin",function(req,res){
    uname = req.body.username;
    upass = req.body.password;
    displayValues(res);
});

router.post("/logout",function(req,res){
    res.redirect("/");
});

router.post("/loggedin/update_monthly_limit/updating_monthly_limit",function(req,res){
    monthlylimit = req.body.monthly_limit;
    var q4 = "UPDATE users SET monthly_budget="+monthlylimit+" WHERE username='"+uname+"'";
    connection.query(q4,function(errors,results,fields){
        if (errors) throw errors;
        remaining = monthlylimit - sum_transactions;
        res.redirect("/rendertransactions");
    });
});

router.post("/loggedin/transactions",function(req,res){
    var eventoritem = req.body.event_or_item;
    var modeofpayment = req.body.mode_of_payment;
    var amountspent = req.body.amount_spent;
    var q3 = "INSERT INTO spendings(users_name,event,payment_method,amount_spent) values('"+uname+"','"+eventoritem+"','"+modeofpayment+"',"+amountspent+")";
    connection.query(q3,function(errors,results,fields){
        if (errors) throw errors;
        displayValues(res);
    });
});

module.exports = router