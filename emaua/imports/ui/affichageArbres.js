import { Template } from 'meteor/templating';
import { Meteor } from 'meteor/meteor';
import { TreeCollection } from '../api/arbres.js';
import { Accounts } from 'meteor/accounts-base';

import '../../client/lib/routes.js'
import '../templates/app.html';
import '../templates/addTreeForm.html';
import '../templates/addTreeCode.html';

Template.addTreeCode.helpers({
    codeArbre: function(){
        let code = FlowRouter.getParam('codeArbre');
        return(code);
    }
})

Template.mainPage.helpers({
     //savoir si l'utilisateur qui observe la page est administrateur
     isAdmin: function(){
        let myID = Meteor.userId();
        let requete = Meteor.users.findOne({_id: myID});
        if(requete.estAdmin){
            Template.instance().isAdmin = new ReactiveVar(true);
        }
        else {
            Template.instance().isAdmin = new ReactiveVar(false);
        }
        return Template.instance().isAdmin.get();
    }
});

Template.mainPage.events({
    'click #addTreeBtn': function(event){
        event.preventDefault();
        FlowRouter.go("addTreeForm");
    },
    'click #codeButton': function(event){
		let myCode = document.getElementById("monCode").value;
        let monArbre = TreeCollection.findOne({codeArbre: myCode});
		if(TreeCollection.findOne({codeArbre: myCode})){
            if(monArbre.nomUtilisateur!="EN ATTENTE DE CODE"){
                alert("Le code est déjà utilisé :(")
            }
            else{
                FlowRouter.go('addTreeCode', {codeArbre: myCode});
            }
		}
		else if(myCode.length > 5){
			alert("Veuillez entrer un code à 5 caractères");
		}
		else if(!TreeCollection.findOne({codeArbre: myCode})){
			alert(myCode + " code invalide !");
		}
	}
})

Template.addTreeForm.events({
    'click #submitTree': function(event){
        event.preventDefault();

        //on récupère toutes les données des inputs
        let nameT = document.getElementById("nomTree").value;
        let dateT = document.getElementById("dateTree").value;
        let nbrT = document.getElementById("nbrTree").value;
        let latLongT = document.getElementById("latLongTree").value;

        let pseudo = "";

        //établissement automatique d'un pseudo qui transforme "John Smith" en "johnsmith"
		if(nameT){
		    let nomPrenom = nameT.split(" ");
            pseudo += nomPrenom[0].toLowerCase();
            pseudo += nomPrenom[1].toLowerCase();
		    alert(pseudo);
        }

        //on génère un code aléatoire
        let charCode = ["A","B","C","D","E","F","G","H","I","J","K","L","M","N","O","P","Q","R","S","T","U","V","W","X","Y","Z","0","1","2","3","4","5","6","7","8","9"];
        let codeT = "";
        for(let i=0; i<5; i++){
            let randomNbr = Math.floor(Math.random()*36);
            codeT += charCode[randomNbr];
        }
        alert(codeT);
        
        //on créer une entrée dans la base de donnée
        if(pseudo!=""){
            Meteor.call('arbres.addTree', pseudo, dateT, nbrT, latLongT, codeT);
        }
        else{
            Meteor.call('arbres.addTree', pseudo, dateT, nbrT, latLongT, codeT);
        }
    },
    'click #homeButton': function(event){
        event.preventDefault();
        FlowRouter.go("home");
    }
});