import { Template } from 'meteor/templating';
import { Meteor } from 'meteor/meteor';
import { TreeCollection } from '../api/arbres.js';
import { Accounts } from 'meteor/accounts-base';

import '../../client/lib/routes.js'
import '../templates/app.html';
import '../templates/loginBtn.html';
import '../templates/loginPage.html';
import '../templates/registerPage.html';
import '../templates/disconnectHeader.html';
import '../templates/changePassword.html';

Template.loginBtn.events({
	//quand on clique sur "se connecter", on charge la page de connexion
    'click #loginButton': function(event){
		FlowRouter.go('loginPage', {typeUsLog: "user"});
	},
	//quand on clique sur "créer un compte, on se créer un compte"
    'click #registerButton': function(event){
		FlowRouter.go('registerPage', {typeUsReg: "free"});
	},
	'click #registerButtonPremium': function(event){
		FlowRouter.go('registerPage', {typeUsReg: "paying"});
	}
});

Template.registerPage.events({
	'click #boutonReg': function(event){
		console.log("I've been pressed !")
		event.preventDefault();

		//récupération des infos des inputs
		let nomFam = document.getElementById("surnameReg").value;
		let prenomUt = document.getElementById("nameReg").value;
		let emailAdrs = document.getElementById("emailReg").value;
		let motDePasse = document.getElementById("passwordReg").value;
		let motDePasseConfirmation = document.getElementById("passwordRegConf").value;

		let nomComplet = prenomUt + " " + nomFam;

		//variables pour des tests plus tard
		let re = /\S+@\S+\.\S+/;
		let i = 1;
		let id;
		let codeT = "";
		
		//établissement automatique d'un pseudo qui transforme "John Smith" en "johnsmith"
		let pseudo = ""
		pseudo += prenomUt.toLowerCase();
		pseudo += nomFam.toLowerCase();
		let pseudoOriginal = pseudo;

		//le premier utilisateur créé est admin
        let monAdmin = false;
        if(Meteor.users.find().count()<1){
            monAdmin = true;
        }

		if(FlowRouter.getParam("typeUsReg")!="free" && FlowRouter.getParam("typeUsReg")!="paying"){
			codeT=FlowRouter.getParam("typeUsReg");
		}

		//si les deux mots de passes ne sont pas les mêmes
		if(motDePasse!=motDePasseConfirmation){
			alert(motDePasse + " Les mots de passes ne sont pas les mêmes !");
		}

		//si l'adress email est invalide
		else if(!emailAdrs.match(re)){
			alert("Votre email n'est pas valide !");
		}

		//s'il manque le nom/prénom
		else if(!prenomUt || !nomFam){
			alert("Veuillez entrer un nom/prénom !");
		}
		else{
			//modifier le pseudo de l'utilisateur si un autre utilisateur a le même 
			//--> transforme "johnsmith" en "johnsmith1" si le premier existe, "johnsmith1" en "johnsmith2" si "johnsmith1" existe, etc
			if(Meteor.users.findOne({username: pseudo})){
				while(Meteor.users.findOne({username: pseudo})){
					pseudo = pseudoOriginal + i
					i++;
				}
			}

			//creation user selon si c'est via code ou non
			if(codeT!="" && codeT!="free" && codeT!="paying"){
				id = Accounts.createUser({
					username: pseudo,
					email: emailAdrs,
					password: motDePasse,
					profile: {
						isAdmin: monAdmin,
						fullName: nomComplet,
						userTier: 0,
						trees: [codeT]
					}
				}, function(error){
					//s'il y a un problème, dire ce qui n'a pas marché
					if(error){
						alert(error.reason);
					}
					else{
						//si le user se crée un compte après avoir entré un code, lui attribuer cet arbre dans la collection TreeCollection
						TreeCollection.update({_id: TreeCollection.findOne({codeArbre: FlowRouter.getParam("typeUsReg")})._id}, 
											  {$set: {nomUtilisateur: pseudo}});
						//se connecter et revenir à la page HOME, qui sera changée puisque le currentuser() est actif
						FlowRouter.go("home");
					}
				});
			}
			else{
				id = Accounts.createUser({
					username: pseudo,
					email: emailAdrs,
					password: motDePasse,
					profile: {
						isAdmin: monAdmin,
						fullName: nomComplet,
						userTier: 0,
						trees: []
					}
				}, function(error){
					//s'il y a un problème, dire ce qui n'a pas marché
					if(error){
						alert(error.reason);
					}
					else{
						FlowRouter.go("home");
					}
				});
			}
		}
	},
	//si on annule, revenir en arrière
	'click #annulerReg': function(event){
		event.preventDefault();
		console.log("annuler")
		FlowRouter.go('home', { _id: Meteor.userId()});
	}
})

Template.loginPage.events({
	//Fonctione pour se log-in
	'click #boutonLogin': function(event){
		event.preventDefault();

		//récupérer les inputs (username + password)
		let nomUt = document.getElementById("usernameLogin").value;
		let mdpUt = document.getElementById("passwordLogin").value;
		let re = /\S+@\S+\.\S+/;

		if(nomUt.match(re)){
			Meteor.loginWithPassword({email: nomUt}, mdpUt, function(error){
				//s'il y a un problème, dire lequel
				if(error){
					alert(error.reason);
				}
				else{
					//si l'utilisateur se connecte après avoir entré un code, lui attribuer cet arbre dans la collection TreeCollection
					if(FlowRouter.getParam("typeUsLog")!="user"){
						Meteor.users.update({_id: Meteor.userId()}, {$push: {"profile.trees": FlowRouter.getParam("typeUsLog")}});
						TreeCollection.update({_id: TreeCollection.findOne({codeArbre: FlowRouter.getParam("typeUsLog")})._id}, 
											  {$set: {nomUtilisateur: Meteor.users.findOne({_id: Meteor.userId()}).username}}
						);
					}
					//dans tous les cas, revenir à la page HOME
					FlowRouter.go('home');
				}
			});
		}
		else if(!nomUt.match(re)){
			Meteor.loginWithPassword({username: nomUt}, mdpUt, function(error){
				//s'il y a un problème, dire lequel
				if(error){
					alert(error.reason);
				}
				else{
					//si l'utilisateur se connecte après avoir entré un code, lui attribuer cet arbre dans la collection TreeCollection
					if(FlowRouter.getParam("typeUsLog")!="user"){
						Meteor.users.update({_id: Meteor.userId()}, {$push: {"profile.trees": FlowRouter.getParam("typeUsLog")}});
						TreeCollection.update({_id: TreeCollection.findOne({codeArbre: FlowRouter.getParam("typeUsLog")})._id}, 
											  {$set: {nomUtilisateur: Meteor.users.findOne({_id: Meteor.userId()}).username}}
						);
					}
					//dans tous les cas, revenir à la page HOME
					FlowRouter.go('home');
				}
			});
		}
	},
	//si on annule, revenir en arrière
	'click #annulerLogin': function(event){
		event.preventDefault();
		FlowRouter.go('home');
	}
});

Template.changePassword.events({
	'submit #formChangePass': function(event){
		event.preventDefault();

		let oldPW = document.getElementById('oldPass').value;
		let newPW = document.getElementById('newPass').value;
		let newPWConf = document.getElementById('newPassConf').value;
		let samePW = false;

		if(newPW == newPWConf){
			samePW = true;
		}

		if(samePW = true){
			Accounts.changePassword(oldPW, newPW, function(error){
				if(error){
					alert(error.reason);
				}
				else{
					alert("Mot de passe modifié !");
					FlowRouter.go("home");
				}
			})
		}
	}
})

Template.disconnectHeader.events({
	//fonction pour se déconnecter
	'click #disconnectUser': function(event){
		event.preventDefault();
		Meteor.logout();
	},
	//fonction admin pour aller ajouter des arbres
    'click #addTreeBtn': function(event){
        event.preventDefault();
        FlowRouter.go("addTreeForm");
    },
	'click #changePassword': function(event){
		event.preventDefault();
		FlowRouter.go("newPassword");
	}
});

Template.disconnectHeader.helpers({
	//donner le nom de l'utilisateur dans le header, ainsi que son niveau de donateur
	nomUser: function(){
		let monUsername = Meteor.users.findOne({_id: Meteor.userId()}).profile.fullName;
		let monUserLevel = Meteor.users.findOne({_id: Meteor.userId()}).profile.userTier;
		let monUserStars = "";

		for(let i = 0; i <= monUserLevel; i++){
			monUserStars += "☆";
		}

        return(monUsername + " | " + monUserStars);
    },
	//savoir si l'utilisateur qui observe la page est administrateur
    'isAdmin': function(){
        let myID = Meteor.userId();
        let requete = Meteor.users.findOne({_id: myID});
        if(requete.profile.isAdmin){
            Template.instance().isAdmin = new ReactiveVar(true);
        }
        else {
            Template.instance().isAdmin = new ReactiveVar(false);
        }
        return Template.instance().isAdmin.get();
    },
});

Template.disconnectHeader.onRendered(function(){
	let monUser = Meteor.users.findOne({_id: Meteor.userId()});
	let userTrees = monUser.profile.trees;
	let nbr = 0;
	userTrees.forEach(function(element){
		let monArbre = TreeCollection.findOne({codeArbre: element});
		console.log(monArbre);
		nbr += monArbre.nombreArbres;
		console.log(nbr);
	});
	if(nbr>5000){
		if(monUser.profile.userTier < 1){
			Meteor.users.update({_id: Meteor.userId()},{$set: {"profile.userTier": 1}});
		}
	}
	if(nbr>10000){
		if(monUser.profile.userTier < 2){
			Meteor.users.update({_id: Meteor.userId()},{$set: {"profile.userTier": 2}});
		}
	}
	if(nbr>25000){
		if(monUser.profile.userTier < 3){
			Meteor.users.update({_id: Meteor.userId()},{$set: {"profile.userTier": 3}});
		}
	}
	if(nbr>50000){
		if(monUser.profile.userTier < 4){
			Meteor.users.update({_id: Meteor.userId()},{$set: {"profile.userTier": 4}});
		}
	}
	if(nbr>100000){
		if(monUser.profile.userTier < 5){
			Meteor.users.update({_id: Meteor.userId()},{$set: {"profile.userTier": 5}});
		}
	}
	let arbresUser = []
	TreeCollection.find({nomUtilisateur: monUser.username}).forEach(function(element){
		arbresUser.push(element.codeArbre);
	});

	let treesUser = monUser.profile.trees;
	let treesToAdd = [];

	if(treesUser.length!=arbresUser.length){
		for(let i=0; i<= arbresUser.length; i++){
			for(let j=0; j<=treesUser.length; j++){
				let arbreUserActuel = treesUser[j];
				let arbreActuel = arbresUser [i];
				if(arbreUserActuel!=arbreActuel){
					treesToAdd.push(arbreActuel); 
				}
			}
		}
	}
});