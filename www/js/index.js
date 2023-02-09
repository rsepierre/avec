var app = {
	// Init function
	init: function () {
		document.addEventListener("deviceready", this.onDeviceReady, false);
	},

	// Scripts order
	onDeviceReady: function () {
		app.setupProfiles();
		app.setupSwiper();
		app.setupButtons();
		FastClick.attach(document.body);
	},

	// Update DOM on a Received Event
	setupSwiper: function () {

		var formSwiper = new Swiper('#app-form', {
			preventClicks: false,						// enables full content interaction
			preventClicksPropagation: false, 			// enables full content interaction
			allowTouchMove: false,	 					// disables swiping interaction
		});

		var navSwiper = new Swiper('#app-navigation', {
			preventClicks: true,						// enables swiping without "slidetoclickedslide" firing
			preventClicksPropagation: true,				// enables swiping without "slidetoclickedslide" firing

			slidesPerView: 'auto',
			slideClass: 'tab-nav',
			slideActiveClass: 'active',
			hiddenClass: 'disabled',
			centeredSlides: true,
			slideToClickedSlide: true,
			controller: {
				control: formSwiper,
				by: 'slide',
			},
			navigation: {
				prevEl: '#previous',
				nextEl: '#next',
			},
			resistanceRatio: 0.2,
		});
	},

	// Data
	attachments: Array(),
	pictures: Array(),
	profiles: $profiles,
	profile: '',
	formData: Array(),

	// Setup profiles selector
	setupProfiles: function () {
		var html = '',
			index = 0;
		app.profiles.forEach(function (profile) {
			fullname = profile.prenom + ' ' + profile.nom;
			html += '<option value="' + index + '" ' + (index ? '' : 'selected') + '>' + fullname + '</option>';
			index++
		});
		$('#expert-profile').append(html);
		$('#expert-profile').on('input', function () { app.profileUpdate() });
	},

	// Set current profile (app.profile)
	profileUpdate: function () {
		var index = $('#expert-profile').val();
		app.profile = app.profiles[index];
		if (app.profile) {
			$('#expert-email').val(app.profile.email);
			$('#expert-tel').val(app.profile.tel);
			$('#expert-city').val(app.profile.ville);
			$('#expert-address').val(app.profile.adresse);
			$('#expert-zip').val(app.profile.zip);
		}
	},

	addPicture: function (fileUri) {
		var key = new Date().getTime();
		app.pictures[key] = fileUri;
		var html = '<div class="card m-1" data-key="' + key + '">';
		html += '<img class="card-img-top" src="' + fileUri + '">';
		html += '<div data-action="deletePicture" class="card-body text-center ">';
		html += 'Supprimer <img src="lib/bootstrap-icons/icons/trash.svg">'
		html += '</div></div>';

		$('#pictureHolder').append(html);
	},

	deletePicture: function (event) {
		var element = $(event.currentTarget).closest('[data-key]');
		var key = element.data('key');
		delete app.pictures[key];
		element.remove();
	},

	takePicture: function () {
		navigator.camera.getPicture(
			function (fileUri) { app.addPicture(fileUri); }, 		// success
			function () { console.log('camera fail'); }, 			// error
			{	// options
				destinationType: Camera.DestinationType.FILE_URI,
				sourceType: Camera.PictureSourceType.CAMERA,
				encodingType: Camera.EncodingType.JPEG,
				saveToPhotoAlbum: true,
				correctOrientation: true,  //Corrects Android orientation quirks
				popoverOptions: new CameraPopoverOptions(300, 300, 100, 100, Camera.PopoverArrowDirection.ARROW_ANY, 300, 600), // iOs only option
			}
		);
	},

	importPicture: function () {
		navigator.camera.getPicture(
			function (fileUri) { app.addPicture(fileUri); }, 		// success
			function () { console.log('camera fail'); }, 			// error
			{ 	// options
				destinationType: Camera.DestinationType.FILE_URI,
				sourceType: Camera.PictureSourceType.PHOTOLIBRARY,
				mediaType: Camera.MediaType.PICTURE,
				encodingType: Camera.EncodingType.JPEG,
				correctOrientation: true,  //Corrects Android orientation quirks
				popoverOptions: new CameraPopoverOptions(300, 300, 100, 100, Camera.PopoverArrowDirection.ARROW_ANY, 300, 600), // iOs only option
			}
		);
	},

	updateAttachments: function () {
		app.attachments = Array();
		for (var index in app.pictures) {
			app.attachments.push(app.pictures[index]);
		}
	},

	updateFormData: function () {
		var serializedData = $('#app-form').serializeArray();
		serializedData.forEach(function (row) {
			app.formData[row.name] = row.value;
		});
	},

	sendReport: function () {
		app.updateFormData();
		app.updateAttachments();
		var args = {
			to: 'charles.guenant@gmail.com',
			cc: app.profile.email,
			bcc: '',
			subject: 'Expertise de ' + app.formData['vehicle-make'] + ' ' + app.formData['vehicle-model'] + ' par ' + app.profile.prenom + ' ' + app.profile.nom,
			body: app.dataToText(),
			attachments: app.attachments,
		}
		cordova.plugins.email.open(args);
	},

	setupButtons: function () {

		$('#app').on('click', '[data-action="deletePicture"]', function (event) { app.deletePicture(event) });

		$('#app').on('click', '[data-action="sendReport"]', function (event) { app.sendReport() });

		$('#app').on('click', '[data-action="camera"]', function (event) { app.takePicture() });

		$('#app').on('click', '[data-action="library"]', function (event) { app.importPicture() });

	},

	dataToText: function () {
		var plainText = 'RAPPORT D\'EXPERTISE';
		plainText += '\n ------------------------ \n';

		plainText += '\n\n Expert :';
		plainText += '\n ------------';
		plainText += '\n Nom : ' + $('#expert-profile option[value="' + app.formData['expert-profile'] + '"').text();
		plainText += '\n E-mail : ' + app.formData['expert-email'];
		plainText += '\n Tel : ' + app.formData['expert-tel'];
		plainText += '\n Adresse : ' + app.formData['expert-address'];
		plainText += '\n Ville : ' + app.formData['expert-city'] + ' ' + app.formData['expert-zip'];

		plainText += '\n\n Client :';
		plainText += '\n ------------';
		plainText += '\n Nom : ' + app.formData['client-gender'] + ' ' + app.formData['client-firstname'] + ' ' + app.formData['client-lastname'];
		plainText += '\n E-mail : ' + app.formData['client-email'];
		plainText += '\n Tel : ' + app.formData['client-tel'];
		plainText += '\n Adresse : ' + app.formData['client-address'];
		plainText += '\n Ville : ' + app.formData['client-city'] + ' ' + app.formData['client-zip'];

		plainText += '\n\n Examen :';
		plainText += '\n ------------';
		plainText += '\n Inspection du véhicule : ' + app.formData['inspection-method'];
		plainText += '\n le : ' + app.formData['inspection-date'];
		plainText += '\n Réalisé à : ' + app.formData['inspection-address'];
		plainText += (app.formData['inspection-onroad'] ? '\n Le véhicule a été essayé sur route.' : '');

		plainText += '\n\n Véhicule :';
		plainText += '\n ------------';
		plainText += '\n Marque : ' + app.formData['vehicle-make'];
		plainText += '\n Modèle : ' + app.formData['vehicle-model'];
		plainText += '\n Année : ' + app.formData['vehicle-year'];

		plainText += '\n\n Categorie :';
		plainText += '\n ------------';
		plainText += '\n Type : ' + app.formData['vehicle-body'];
		plainText += '\n Portes : ' + (app.formData['vehicle-doors'] == 6 ? '6 et plus' : app.formData['vehicle-doors']);
		plainText += '\n Places : ' + (app.formData['vehicle-sits'] == 6 ? '6 et plus' : app.formData['vehicle-sits']);
		plainText += '\n Chevaux fiscaux : ' + app.formData['vehicle-fiscalhp'];

		plainText += '\n\n Identification :';
		plainText += '\n ------------';
		plainText += '\n N° de série : ' + app.formData['vehicle-serial'];
		plainText += '\n Immatriculation : ' + app.formData['vehicle-registration'];
		plainText += '\n Plaque constructeur : ' + app.formData['vehicle-plate'] + (app.formData['vehicle-plate-coldstamped'] ? ' (frappée à froid)' : '');
		plainText += '\n Mise en circulation le : ' + app.formData['vehicle-release'];
		plainText += '\n Carte grise émise le : ' + app.formData['vehicle-graycardissue'];
		plainText += '\n Dernier contrôle Technique le : ' + app.formData['vehicle-roadworthy'];

		plainText += '\n\n Aperçu :';
		plainText += '\n ------------';
		plainText += '\n État général : ' + app.formData['general-state'] + '%';
		plainText += '\n Conformité : ' + app.formData['general-conformity'];
		plainText += '\n Fonctionnement : ' + (app.formData['general-working'] ? 'En état de rouler' : 'Ne peux pas rouler');

		plainText += '\n\n Exterieur :';
		plainText += '\n ------------';
		plainText += '\n Pare-choc avant : ' + app.formData['front-bumper-state'] + '% (' + app.formData['front-bumper-modification'] + ')';
		plainText += '\n Pare-choc arrière : ' + app.formData['rear-bumper-state'] + '% (' + app.formData['rear-bumper-modification'] + ')';
		plainText += '\n Calandre : ' + app.formData['calender-state'] + '% (' + app.formData['calender-modification'] + ')';
		plainText += '\n Capot : ' + app.formData['hood-state'] + '% (' + app.formData['hood-modification'] + ')';
		plainText += '\n Aile gauche : ' + app.formData['left-wing-state'] + '% (' + app.formData['left-wing-modification'] + ')';
		plainText += '\n Aile droite : ' + app.formData['right-wing-state'] + '% (' + app.formData['right-wing-modification'] + ')';
		plainText += '\n Pare-brise : ' + app.formData['windshield-state'] + '% (' + app.formData['windshield-modification'] + ')';
		plainText += '\n Glaces latérales : ' + app.formData['side-windows-state'] + '% (' + app.formData['side-windows-modification'] + ')';
		plainText += '\n Pavillon : ' + app.formData['overhead-state'] + '% (' + app.formData['overhead-modification'] + ')';
		plainText += '\n Porte avant gauche : ' + app.formData['left-door-state'] + '% (' + app.formData['left-door-modification'] + ')';
		plainText += '\n Porte avant droite : ' + app.formData['right-door-state'] + '% (' + app.formData['right-door-modification'] + ')';
		plainText += '\n Lunette arrière : ' + app.formData['rear-window-state'] + '% (' + app.formData['rear-window-modification'] + ')';
		plainText += '\n Couvercle du coffre : ' + app.formData['trunk-lid-state'] + '% (' + app.formData['trunk-lid-modification'] + ')';
		plainText += '\n Plancher du coffre : ' + app.formData['trunk-floor-state'] + '% (' + app.formData['trunk-floor-modification'] + ')';
		plainText += '\n Chassis : ' + app.formData['chassis-state'] + '% (' + app.formData['chassis-modification'] + ')';

		plainText += '\n\n Peinture :';
		plainText += '\n ------------';
		plainText += '\n Couleur : ' + app.formData['paint-color'];
		plainText += '\n Finition : ' + app.formData['paint-finish'];
		plainText += '\n État : ' + app.formData['paint-state'] + '%';

		plainText += '\n\n Roues :';
		plainText += '\n ------------';
		plainText += '\n Type : ' + app.formData['wheel-type'];
		plainText += '\n Dimension (avant) : ' + app.formData['wheel-front-size'] + ' pouces';
		plainText += '\n État (avant) : ' + app.formData['wheel-front-state'] + '%';
		plainText += '\n Dimension (arrière) : ' + app.formData['wheel-rear-size'] + ' pouces';
		plainText += '\n État (arrière) : ' + app.formData['wheel-rear-state'] + '%';

		plainText += '\n\n Pneus :';
		plainText += '\n ------------';
		plainText += '\n Marque : ' + app.formData['tire-brand'];
		plainText += '\n Type : ' + app.formData['tire-type'];
		plainText += '\n Dimension (avant) : ' + app.formData['tire-front-size'] + ' pouces';
		plainText += '\n État (avant) : ' + app.formData['tire-front-state'] + '%';
		plainText += '\n Dimension (arrière) : ' + app.formData['tire-rear-size'] + ' pouces';
		plainText += '\n État (arrière) : ' + app.formData['tire-rear-state'] + '%';

		plainText += '\n\n Intérieur :';
		plainText += '\n ------------';
		plainText += '\n Tableau de bord : ' + app.formData['dashboard-state'] + '% (' + app.formData['dashboard-modification'] + ')';
		plainText += '\n Console : ' + app.formData['console-state'] + '% (' + app.formData['console-modification'] + ')';
		plainText += '\n Instrumentation : ' + app.formData['instrumentation-state'] + '% (' + app.formData['instrumentation-modification'] + ')';
		plainText += '\n Siège conducteur : ' + app.formData['driver-sit-state'] + '% (' + app.formData['driver-sit-modification'] + ')';
		plainText += '\n Siège passager : ' + app.formData['passenger-sit-state'] + '% (' + app.formData['passenger-sit-modification'] + ')';
		plainText += '\n Sièges arrière : ' + app.formData['back-sits-state'] + '% (' + app.formData['back-sits-modification'] + ')';
		plainText += '\n Tapis : ' + app.formData['carpet-state'] + '% (' + app.formData['carpet-modification'] + ')';
		plainText += '\n Garniture intérieure : ' + app.formData['interior-lining-state'] + '% (' + app.formData['interior-lining-modification'] + ')';
		plainText += '\n Garniture du pavillon : ' + app.formData['overhead-lining-state'] + '% (' + app.formData['overhead-lining-modification'] + ')';
		plainText += '\n Panneaux de garnissage - portière gauche : ' + app.formData['right-door-lining-state'] + '% (' + app.formData['right-door-lining-modification'] + ')';
		plainText += '\n Panneaux de garnissage - portière droite : ' + app.formData['left-door-lining-state'] + '% (' + app.formData['left-door-lining-modification'] + ')';
		plainText += '\n Joints d\'étanchéité des portières : ' + app.formData['door-seals-state'] + '% (' + app.formData['door-seals-modification'] + ')';

		plainText += '\n\n Garniture :';
		plainText += '\n ------------';
		var liningMaterials = Array(
			app.formData['lining-material-1'],
			app.formData['lining-material-2'],
			app.formData['lining-material-3'],
			app.formData['lining-material-4'],
			app.formData['lining-material-5']
		);
		plainText += '\n Matières :\n ' + liningMaterials.filter(Boolean).join(', ');

		plainText += '\n\n Options :';
		plainText += '\n ------------';
		var optionExterior = Array(
			app.formData['options-exterior-1'],
			app.formData['options-exterior-2'],
			app.formData['options-exterior-3'],
			app.formData['options-exterior-4'],
			app.formData['options-exterior-5'],
			app.formData['options-exterior-6'],
			app.formData['options-exterior-7']
		);
		plainText += '\n Extérieures :\n ' + optionExterior.filter(Boolean).join(', ');
		var optionInterior = Array(
			app.formData['options-interior-1'],
			app.formData['options-interior-2'],
			app.formData['options-interior-3'],
			app.formData['options-interior-4'],
			app.formData['options-interior-5'],
			app.formData['options-interior-6'],
			app.formData['options-interior-7'],
			app.formData['options-interior-8'],
			app.formData['options-interior-9']
		);
		plainText += '\n Intérieures :\n ' + optionInterior.filter(Boolean).join(', ');
		var optionSafety = Array(
			app.formData['options-safety-1'],
			app.formData['options-safety-2'],
			app.formData['options-safety-3'],
			app.formData['options-safety-4'],
			app.formData['options-safety-5'],
			app.formData['options-safety-6'],
			app.formData['options-safety-7'],
			app.formData['options-safety-8'],
			app.formData['options-safety-9']
		);
		plainText += '\n Sécurité :\n ' + optionSafety.filter(Boolean).join(', ');

		plainText += '\n\n Moteur :';
		plainText += '\n ------------';
		plainText += '\n Marque : ' + app.formData['engine-make'];
		plainText += '\n Cylindrée : ' + app.formData['engine-displacement'];
		plainText += '\n Distribution : ' + app.formData['engine-distribution'];
		plainText += '\n Disposition des carburateurs : ' + app.formData['engine-carburator'];
		plainText += '\n Présentation du compartiment moteur : ' + app.formData['engine-presentation'];
		plainText += '\n Bruit : ' + app.formData['engine-noise'];
		plainText += (app.formData['engine-restoration'] ? '\n Restauration en cours' : '');
		plainText += (app.formData['engine-incomplete'] ? '\n Moteur incomplet' : '');
		plainText += (app.formData['engine-storage'] ? '\n Véhicule en remisage' : '');

		plainText += '\n\n Boîte de vitesse :';
		plainText += '\n ------------';
		plainText += '\n Rapports de boîte : ' + app.formData['gearbox-gears'];
		plainText += '\n Type : ' + app.formData['gearbox-type'];
		plainText += '\n Transmission : ' + app.formData['gearbox-transmission'];
		plainText += '\n Différentiel : ' + app.formData['gearbox-differential'];

		plainText += '\n\n Freinage :';
		plainText += '\n ------------';
		var breaksOptions = Array(
			app.formData['breaks-option-1'],
			app.formData['breaks-option-2'],
			app.formData['breaks-option-3'],
			app.formData['breaks-option-4'],
			app.formData['breaks-option-5'],
			app.formData['breaks-option-6'],
			app.formData['breaks-option-7']
		);
		plainText += '\n Détail :\n ' + breaksOptions.filter(Boolean).join(', ');
		plainText += (app.formData['breaks-modified'] ? '\n Modifiés par rapport à l\'origine' : '\n Conforme à l\'origine');

		plainText += '\n\n Direction :';
		plainText += '\n ------------';
		plainText += '\n Type : ' + app.formData['direction-type'];
		plainText += (app.formData['direction-modified'] ? '\n Modifiés par rapport à l\'origine' : '\n Conforme à l\'origine');

		plainText += '\n\n Échappement :';
		plainText += '\n ------------';
		plainText += '\n Type : ' + app.formData['exhaust-type'];
		plainText += (app.formData['exhaust-modified'] ? '\n Modifiés par rapport à l\'origine' : '\n Conforme à l\'origine');

		plainText += '\n\n Synthèse :';
		plainText += '\n ------------';
		var documents = Array(
			app.formData['document-1'],
			app.formData['document-2'],
			app.formData['document-3'],
			app.formData['document-4'],
			app.formData['document-5']
		);
		plainText += '\n Documents disponibles :\n ' + documents.filter(Boolean).join(', ');

		plainText += '\n\n Points forts : ' + app.formData['good'];

		plainText += '\n\n À améliorer : ' + app.formData['bad'];

		plainText += '\n\n Estimation : ' + app.formData['estimate'] + ' €';


		return plainText;
	},

};

app.init();


