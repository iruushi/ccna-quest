/* Contenu CCNA : modules NetAcad, défis mobiles, labos Packet Tracer.
   Syntaxe des motifs de commandes (défis "cmd") :
   - "interface:3" = mot abrégeable dès 3 lettres (int, inte, interface)
   - "@g0/0/0" ou "@f0/5" = nom d'interface (g0/0/0, gi0/0/0, GigabitEthernet0/0/0…)
   - "/regex/" = morceau d'expression régulière brut
   - autre mot = littéral (insensible à la casse)
   Un motif = une ligne attendue. "seq" = la 2e ligne doit suivre la 1re
   (dans le même contexte d'interface ou de line). */

const DATA = {
  courses: [
    { id: 'itn', name: 'Présentation des réseaux (ITN)', short: 'ITN', modules: [
      'Les réseaux aujourd\'hui', 'Configuration de base des commutateurs et des terminaux',
      'Protocoles et modèles', 'Couche physique', 'Systèmes de numération',
      'Couche liaison de données', 'Commutation Ethernet', 'Couche réseau',
      'Résolution d\'adresse', 'Configuration de base d\'un routeur', 'Adressage IPv4',
      'Adressage IPv6', 'ICMP', 'Couche transport', 'Couche application',
      'Notions de base sur la sécurité réseau', 'Création d\'un petit réseau'] },
    { id: 'srwe', name: 'Switching, Routing & Wireless Essentials (SRWE)', short: 'SRWE', modules: [
      'Configuration de base des équipements', 'Concepts de commutation', 'VLAN',
      'Routage inter-VLAN', 'Concepts STP', 'EtherChannel', 'DHCPv4',
      'Concepts SLAAC et DHCPv6', 'Concepts FHRP', 'Concepts de sécurité LAN',
      'Configuration de la sécurité des commutateurs', 'Concepts WLAN',
      'Configuration WLAN', 'Concepts de routage', 'Routes statiques IP',
      'Dépannage des routes statiques et par défaut'] },
    { id: 'ensa', name: 'Enterprise Networking, Security & Automation (ENSA)', short: 'ENSA', modules: [
      'Concepts OSPFv2 à zone unique', 'Configuration OSPFv2 à zone unique',
      'Concepts de sécurité réseau', 'Concepts des ACL', 'ACL pour la configuration IPv4',
      'NAT pour IPv4', 'Concepts WAN', 'Concepts VPN et IPsec', 'Concepts QoS',
      'Gestion du réseau', 'Conception de réseaux', 'Dépannage réseau',
      'Virtualisation du réseau', 'Automatisation du réseau'] }
  ],

  /* Défis mobiles : QCM contextualisés (ticket = situation chez Ar Mor Logistique) */
  mcq: [
    { m: 'itn:7', ticket: 'Le switch de l\'entrepôt reçoit une trame pour une adresse MAC qui n\'est pas dans sa table.',
      q: 'Que fait-il ?', o: ['Il détruit la trame', 'Il l\'envoie sur tous les ports du VLAN sauf le port d\'entrée', 'Il l\'envoie au routeur', 'Il envoie une requête ARP'],
      a: 1, e: 'Trame unicast inconnue : le switch l\'inonde sur tous les ports du même VLAN, sauf celui d\'où elle vient.' },
    { m: 'itn:9', ticket: 'Le PC du bureau (192.168.10.10/24) doit joindre le serveur 8.8.8.8 pour la première fois.',
      q: 'Pour quelle adresse IP le PC envoie-t-il sa requête ARP ?', o: ['8.8.8.8', '192.168.10.255', 'Sa passerelle par défaut', 'Aucune, il utilise DNS'],
      a: 2, e: 'La destination est hors du sous-réseau : le PC a besoin de la MAC de sa passerelle, c\'est elle qu\'il résout en ARP.' },
    { m: 'itn:10', ticket: 'Le LAN Entrepôt ne répond plus. Sur AML-R1 :\nGigabitEthernet0/0/1  192.168.11.1  YES manual administratively down  down',
      q: 'Quelle commande corrige le problème (dans l\'interface) ?', o: ['no shutdown', 'ip address dhcp', 'clock rate 64000', 'duplex auto'],
      a: 0, e: '« administratively down » = interface désactivée par un « shutdown ». Il faut un « no shutdown ».' },
    { m: 'itn:2', ticket: 'Depuis le LAN Entrepôt, impossible de pinger l\'IP de gestion du switch AML-S1 (SVI VLAN 1). Depuis le LAN Bureau, ça marche.',
      q: 'Cause la plus probable ?', o: ['La SVI est éteinte', 'Le switch n\'a pas de « ip default-gateway »', 'Le mot de passe console manque', 'Le câble est croisé'],
      a: 1, e: 'Le switch répond à son propre sous-réseau, mais sans passerelle par défaut il ne sait pas renvoyer la réponse vers un autre réseau.' },
    { m: 'itn:4', ticket: 'Une liaison est lente. « show interfaces » montre des erreurs CRC et des « late collisions » qui augmentent.',
      q: 'Cause typique ?', o: ['Mauvais masque', 'Incohérence de duplex', 'VLAN natif différent', 'Câble trop court'],
      a: 1, e: 'Les collisions tardives sont la signature classique d\'un côté en full-duplex et l\'autre en half-duplex.' },
    { m: 'itn:14', ticket: 'L\'agence installe de la téléphonie sur IP.',
      q: 'Quel protocole de transport transporte la voix ?', o: ['TCP, pour la fiabilité', 'UDP, pour la faible latence', 'ICMP', 'ARP'],
      a: 1, e: 'La voix tolère quelques pertes mais pas les retransmissions : UDP (avec RTP).' },
    { m: 'itn:15', ticket: 'Un nouveau PC obtient son adresse automatiquement.',
      q: 'Ordre des messages DHCPv4 ?', o: ['Request, Offer, Discover, Ack', 'Discover, Offer, Request, Ack', 'Discover, Request, Offer, Ack', 'Offer, Discover, Ack, Request'],
      a: 1, e: 'DORA : Discover, Offer, Request, Acknowledgment.' },
    { m: 'itn:13', ticket: 'Tu veux voir par quels routeurs passent les paquets vers le siège.',
      q: 'Quel outil exploite le champ TTL pour ça ?', o: ['ping', 'traceroute / tracert', 'nslookup', 'arp -a'],
      a: 1, e: 'traceroute envoie des paquets avec un TTL croissant ; chaque routeur qui le fait expirer répond en ICMP « Time Exceeded ».' },
    { m: 'itn:3', ticket: 'Révision du modèle OSI pour former le stagiaire.',
      q: 'Comment s\'appelle le PDU de la couche transport ?', o: ['Trame', 'Paquet', 'Segment', 'Bit'],
      a: 2, e: 'Transport = segment (ou datagramme en UDP), réseau = paquet, liaison = trame, physique = bits.' },
    { m: 'itn:16', ticket: 'L\'IDS signale un balayage de ping puis des scans de ports sur le LAN.',
      q: 'Quel type d\'attaque est en cours ?', o: ['Déni de service', 'Reconnaissance', 'Attaque d\'accès', 'Ver'],
      a: 1, e: 'Ping sweep + scan de ports = phase de reconnaissance : l\'attaquant cartographie avant d\'attaquer.' },
    { m: 'itn:8', ticket: 'Dans « show ip route » de AML-R1 :\nL   192.168.10.1/32 is directly connected, GigabitEthernet0/0/0',
      q: 'Que signifie le code L ?', o: ['Route apprise par un protocole Link-state', 'Adresse locale de l\'interface du routeur', 'Route vers un LAN distant', 'Route par défaut'],
      a: 1, e: 'L = Local : l\'adresse IP configurée sur l\'interface elle-même, en /32. C = le réseau directement connecté.' },
    { m: 'itn:12', ticket: 'Un PC génère son identifiant d\'interface IPv6 avec EUI-64.',
      q: 'Que fait EUI-64 à partir de la MAC ?', o: ['Il la hache en MD5', 'Il insère FFFE au milieu et inverse le 7e bit', 'Il ajoute FE80 devant', 'Il la répète deux fois'],
      a: 1, e: 'MAC 48 bits coupée en deux, FFFE inséré au milieu, et inversion du bit U/L (7e bit du premier octet).' },
    { m: 'itn:6', ticket: 'Tu analyses une trame Ethernet sur Wireshark.',
      q: 'Quel champ sert à détecter les erreurs ?', o: ['Préambule', 'EtherType', 'FCS', 'TTL'],
      a: 2, e: 'Le FCS (Frame Check Sequence) contient un CRC calculé par l\'émetteur et vérifié par le récepteur.' },
    { m: 'srwe:3', ticket: 'Le PC Compta sur Fa0/5 n\'atteint pas les autres PC Compta (VLAN 10). « show vlan brief » liste Fa0/5 sous VLAN 1 default.',
      q: 'Correction ?', o: ['switchport mode trunk', 'switchport access vlan 10 sur Fa0/5', 'vlan 1 name COMPTA', 'no shutdown sur VLAN 10'],
      a: 1, e: 'Le port est resté dans le VLAN 1. Il faut « switchport mode access » puis « switchport access vlan 10 ».' },
    { m: 'srwe:4', ticket: 'Routeur-on-a-stick : la sous-interface G0/0/1.10 a son IP, mais le VLAN 10 ne route pas.',
      q: 'Que manque-t-il le plus souvent ?', o: ['encapsulation dot1Q 10', 'ip routing', 'switchport mode access', 'spanning-tree portfast'],
      a: 0, e: 'Sans « encapsulation dot1Q 10 », la sous-interface ne sait pas quel VLAN elle traite.' },
    { m: 'srwe:5', ticket: 'Trois switchs en boucle, tous à la priorité par défaut.',
      q: 'Qui devient pont racine STP ?', o: ['Celui avec le plus de ports', 'Celui avec la MAC la plus basse', 'Celui avec l\'IP la plus haute', 'Le premier allumé'],
      a: 1, e: 'Bridge ID le plus bas gagne. À priorité égale, c\'est la MAC la plus basse qui départage.' },
    { m: 'srwe:7', ticket: 'Le serveur DHCP est au siège, les PC de l\'agence sont derrière AML-R1.',
      q: 'Que configurer sur l\'interface LAN de AML-R1 ?', o: ['ip dhcp pool', 'ip helper-address <IP du serveur>', 'ip nat inside', 'ip default-gateway'],
      a: 1, e: 'Le broadcast DHCP ne traverse pas le routeur : « ip helper-address » le relaie en unicast vers le serveur.' },
    { m: 'srwe:11', ticket: 'Port-security est activé sur Fa0/5 sans préciser le mode de violation. Un 2e PC se branche via un mini-switch.',
      q: 'Que se passe-t-il ?', o: ['Rien, il est juste journalisé', 'Le port passe en err-disabled', 'Le trafic du 2e PC est jeté, le port reste up', 'Le switch redémarre'],
      a: 1, e: 'Le mode par défaut est « shutdown » : le port passe err-disabled.' },
    { m: 'srwe:15', ticket: 'Tu veux une route statique de secours, utilisée seulement si la route OSPF tombe.',
      q: 'Comment faire ?', o: ['Lui donner une distance administrative plus haute que 110', 'Lui donner un métrique de 0', 'La mettre en premier dans la config', 'Utiliser un masque /32'],
      a: 0, e: 'Route statique flottante : AD supérieure à celle de la route principale (OSPF = 110), par exemple 120.' },
    { m: 'ensa:1', ticket: 'AML-R1 n\'a pas de commande router-id, mais a une Loopback0 10.0.0.1 et une G0/0/0 en 192.168.10.1.',
      q: 'Quel router ID OSPF prend-il ?', o: ['192.168.10.1', '10.0.0.1', '0.0.0.0', '1.1.1.1'],
      a: 1, e: 'Ordre : commande router-id, sinon plus haute IP de loopback, sinon plus haute IP d\'interface active.' },
    { m: 'ensa:4', ticket: 'Tu dois filtrer avec une ACL standard.',
      q: 'Où la placer ?', o: ['Au plus près de la source', 'Au plus près de la destination', 'Sur le routeur du FAI', 'Peu importe'],
      a: 1, e: 'Une ACL standard ne filtre que sur la source : trop près de la source, elle bloquerait tout. Près de la destination.' },
    { m: 'ensa:4', ticket: 'Une ACL ne contient qu\'une ligne « deny 192.168.30.0 0.0.0.255 ».',
      q: 'Que devient le reste du trafic ?', o: ['Autorisé', 'Refusé par le deny implicite final', 'Envoyé en log', 'Dépend du VLAN'],
      a: 1, e: 'Toute ACL finit par un « deny any » implicite. Sans « permit any », tout est bloqué.' },
    { m: 'ensa:6', ticket: 'Tous les PC de l\'agence sortent sur Internet avec la seule IP publique de AML-R1.',
      q: 'Comment s\'appelle ce type de NAT ?', o: ['NAT statique', 'NAT dynamique avec pool', 'PAT (NAT overload)', 'NAT64'],
      a: 2, e: 'PAT : plusieurs adresses privées traduites vers une seule IP publique, différenciées par les ports.' }
  ],

  /* Défis mobiles : écrire les commandes IOS */
  cmd: [
    { m: 'itn:2', ticket: 'Le switch AML-S1 sort du carton.', q: 'Nomme-le AML-S1 et protège le mode privilégié avec le mot de passe chiffré Brest29.',
      checks: [{ l: 'Nom d\'hôte', p: 'hostname:4 AML-S1' }, { l: 'enable secret', p: 'enable:2 secret:2 Brest29' }],
      sol: 'hostname AML-S1\nenable secret Brest29' },
    { m: 'itn:2', ticket: 'L\'accès console de AML-S1 est ouvert à tous.', q: 'Protège la ligne console avec le mot de passe cisco et active la demande de mot de passe.',
      checks: [{ l: 'Ligne console', p: 'line:2 console:3 0' }, { l: 'Mot de passe', p: 'password:4 cisco' }, { l: 'login', p: 'login:4' }],
      sol: 'line console 0\n password cisco\n login' },
    { m: 'itn:2', ticket: 'Tu veux administrer AML-S1 à distance.', q: 'Donne à la SVI du VLAN 1 l\'adresse 192.168.10.2/24, active-la, et configure la passerelle 192.168.10.1.',
      checks: [{ l: 'Interface VLAN 1', p: 'interface:3 /vlan\\s*1/' }, { l: 'Adresse IP', p: 'ip address:3 192.168.10.2 255.255.255.0' },
        { l: 'Activation', p: 'no shutdown:4' }, { l: 'Passerelle', p: 'ip default-gateway:9 192.168.10.1' }],
      sol: 'interface vlan 1\n ip address 192.168.10.2 255.255.255.0\n no shutdown\n exit\nip default-gateway 192.168.10.1' },
    { m: 'itn:2', ticket: 'Coupure de courant prévue cette nuit.', q: 'Sauvegarde la configuration active dans la NVRAM.',
      checks: [{ l: 'Sauvegarde', p: '/(copy\\s+run(ning-config)?\\s+start(up-config)?|wr(ite)?(\\s+mem(ory)?)?)/' }],
      sol: 'copy running-config startup-config' },
    { m: 'itn:10', ticket: 'Mise en service du routeur AML-R1.', q: 'Sur G0/0/0 : adresse 192.168.10.1/24, description LAN-BUREAU, et active l\'interface.',
      checks: [{ l: 'Interface', p: 'interface:3 @g0/0/0' }, { l: 'Adresse IP', p: 'ip address:3 192.168.10.1 255.255.255.0' },
        { l: 'Description', p: 'description:4 LAN-BUREAU' }, { l: 'no shutdown', p: 'no shutdown:4' }],
      sol: 'interface g0/0/0\n description LAN-BUREAU\n ip address 192.168.10.1 255.255.255.0\n no shutdown' },
    { m: 'itn:10', ticket: 'Le service juridique veut un avertissement à la connexion.', q: 'Configure une bannière MOTD « Acces reserve » délimitée par #.',
      checks: [{ l: 'Bannière MOTD', p: 'banner:3 motd:2 /#.+#/' }], sol: 'banner motd #Acces reserve#' },
    { m: 'itn:12', ticket: 'L\'agence passe en double pile.', q: 'Active le routage IPv6, puis sur G0/0/1 : 2001:db8:acad:11::1/64 et la link-local fe80::1.',
      checks: [{ l: 'Routage IPv6', p: 'ipv6 unicast-routing:7' }, { l: 'Interface', p: 'interface:3 @g0/0/1' },
        { l: 'Adresse globale', p: 'ipv6 address:3 2001:db8:acad:11::1/64' }, { l: 'Link-local', p: 'ipv6 address:3 fe80::1 link-local:4' }],
      sol: 'ipv6 unicast-routing\ninterface g0/0/1\n ipv6 address 2001:db8:acad:11::1/64\n ipv6 address fe80::1 link-local' },
    { m: 'itn:16', ticket: 'Telnet circule en clair, l\'RSSI veut du SSH sur AML-R1.', q: 'Domaine armor.bzh, clés RSA 2048, utilisateur admin (secret Admin29!), SSH v2, et lignes VTY 0 4 en SSH uniquement avec login local.',
      checks: [{ l: 'Nom de domaine', p: 'ip domain-name:8 armor.bzh' }, { l: 'Clés RSA', p: 'crypto:4 key:3 generate:3 /rsa(\\s+general-keys)?(\\s+modulus\\s+2048)?/' },
        { l: 'Utilisateur local', p: 'username:5 /admin(\\s+privilege\\s+\\d+)?/ secret:3 Admin29!' }, { l: 'SSH v2', p: 'ip ssh:3 version:3 2' },
        { l: 'Lignes VTY', p: 'line:2 vty:2 0 4' }, { l: 'SSH seulement', p: 'transport:5 input:2 ssh' }, { l: 'login local', p: 'login:4 local:3' }],
      sol: 'ip domain-name armor.bzh\ncrypto key generate rsa modulus 2048\nusername admin secret Admin29!\nip ssh version 2\nline vty 0 4\n transport input ssh\n login local' },
    { m: 'itn:16', ticket: 'Audit sécurité : les mots de passe sont lisibles dans la config.', q: 'Chiffre les mots de passe en clair, impose 10 caractères minimum et bloque les connexions 120 s après 3 échecs en 60 s.',
      checks: [{ l: 'Chiffrement', p: 'service:4 password-encryption:10' }, { l: 'Longueur mini', p: 'security:3 passwords:5 min-length:5 10' },
        { l: 'Anti-bruteforce', p: 'login:4 block-for:7 120 attempts:4 3 within:4 60' }],
      sol: 'service password-encryption\nsecurity passwords min-length 10\nlogin block-for 120 attempts 3 within 60' },
    { m: 'itn:17', ticket: 'Vérification rapide après intervention.', q: 'Quelle commande affiche en résumé l\'IP et l\'état de toutes les interfaces ?',
      checks: [{ l: 'Commande', p: 'show:2 ip interface:3 brief:2' }], sol: 'show ip interface brief' },
    { m: 'srwe:3', ticket: 'Création du service Compta.', q: 'Crée le VLAN 10 nommé COMPTA et place Fa0/5 dedans en mode accès.',
      checks: [{ l: 'VLAN 10', p: 'vlan 10' }, { l: 'Nom', p: 'name:4 COMPTA' }, { l: 'Interface', p: 'interface:3 @f0/5' },
        { l: 'Mode accès', p: 'switchport:6 mode:2 access:2' }, { l: 'VLAN d\'accès', p: 'switchport:6 access:2 vlan:2 10' }],
      sol: 'vlan 10\n name COMPTA\ninterface f0/5\n switchport mode access\n switchport access vlan 10' },
    { m: 'srwe:3', ticket: 'Liaison entre AML-S1 et AML-S2.', q: 'Passe G0/1 en trunk avec le VLAN natif 99.',
      checks: [{ l: 'Interface', p: 'interface:3 @g0/1' }, { l: 'Mode trunk', p: 'switchport:6 mode:2 trunk:2' }, { l: 'VLAN natif', p: 'switchport:6 trunk:2 native:3 vlan:2 99' }],
      sol: 'interface g0/1\n switchport mode trunk\n switchport trunk native vlan 99' },
    { m: 'srwe:4', ticket: 'Routage inter-VLAN sur AML-R1.', q: 'Crée la sous-interface G0/0/1.10 pour le VLAN 10 avec l\'adresse 192.168.10.1/24.',
      checks: [{ l: 'Sous-interface', p: 'interface:3 @g0/0/1.10' }, { l: 'Encapsulation', p: 'encapsulation:5 dot1q:4 10' },
        { l: 'Adresse IP', p: 'ip address:3 192.168.10.1 255.255.255.0' }],
      sol: 'interface g0/0/1.10\n encapsulation dot1q 10\n ip address 192.168.10.1 255.255.255.0' },
    { m: 'srwe:15', ticket: 'L\'agence sort sur Internet via le FAI (203.0.113.1).', q: 'Configure la route par défaut IPv4.',
      checks: [{ l: 'Route par défaut', p: 'ip route:3 0.0.0.0 0.0.0.0 203.0.113.1' }], sol: 'ip route 0.0.0.0 0.0.0.0 203.0.113.1' },
    { m: 'srwe:11', ticket: 'Le stagiaire a branché un switch perso sur Fa0/5.', q: 'Port-security sur Fa0/5 : 2 MAC max, apprises en sticky, violation en restrict.',
      checks: [{ l: 'Interface', p: 'interface:3 @f0/5' }, { l: 'Activation', p: 'switchport:6 port-security:6' },
        { l: 'Maximum', p: 'switchport:6 port-security:6 maximum:3 2' }, { l: 'Sticky', p: 'switchport:6 port-security:6 mac-address:3 sticky:3' },
        { l: 'Violation', p: 'switchport:6 port-security:6 violation:3 restrict:4' }],
      sol: 'interface f0/5\n switchport mode access\n switchport port-security\n switchport port-security maximum 2\n switchport port-security mac-address sticky\n switchport port-security violation restrict' },
    { m: 'ensa:2', ticket: 'Raccordement de l\'agence au backbone OSPF.', q: 'Processus OSPF 10, router-id 1.1.1.1, annonce 192.168.10.0/24 en zone 0.',
      checks: [{ l: 'Processus', p: 'router:3 ospf:2 10' }, { l: 'Router ID', p: 'router-id:7 1.1.1.1' }, { l: 'Réseau', p: 'network:3 192.168.10.0 0.0.0.255 area:2 0' }],
      sol: 'router ospf 10\n router-id 1.1.1.1\n network 192.168.10.0 0.0.0.255 area 0' },
    { m: 'ensa:5', ticket: 'Les invités (192.168.30.0/24) ne doivent pas joindre le LAN Compta derrière G0/0/1.', q: 'ACL standard numéro 10, puis applique-la en sortie de G0/0/1.',
      checks: [{ l: 'Refus des invités', p: 'access-list:8 10 deny:2 192.168.30.0 0.0.0.255' }, { l: 'Autoriser le reste', p: 'access-list:8 10 permit:2 any:2' },
        { l: 'Interface', p: 'interface:3 @g0/0/1' }, { l: 'Application', p: 'ip access-group:8 10 out' }],
      sol: 'access-list 10 deny 192.168.30.0 0.0.0.255\naccess-list 10 permit any\ninterface g0/0/1\n ip access-group 10 out' },
    { m: 'ensa:6', ticket: 'Sortie Internet de l\'agence.', q: 'PAT : ACL 1 autorise 192.168.0.0/16, traduction vers l\'IP de G0/0/0 (overload). G0/0/1 = inside, G0/0/0 = outside.',
      checks: [{ l: 'ACL', p: 'access-list:8 1 permit:2 192.168.0.0 0.0.255.255' }, { l: 'Règle NAT', p: 'ip nat:3 inside:2 source:2 list:2 1 interface:3 @g0/0/0 overload:4' },
        { l: 'Inside', p: 'ip nat:3 inside:2' }, { l: 'Outside', p: 'ip nat:3 outside:3' }],
      sol: 'access-list 1 permit 192.168.0.0 0.0.255.255\nip nat inside source list 1 interface g0/0/0 overload\ninterface g0/0/1\n ip nat inside\ninterface g0/0/0\n ip nat outside' }
  ],

  /* Générateurs infinis (type → module qui les débloque) */
  gens: [
    { type: 'subnet', m: 'itn:11', name: 'Sous-réseau éclair' },
    { type: 'binary', m: 'itn:5', name: 'Conversion binaire' },
    { type: 'ipv6', m: 'itn:12', name: 'Compression IPv6' },
    { type: 'wildcard', m: 'ensa:4', name: 'Masque générique' }
  ],

  /* Labos Packet Tracer scénarisés — campagne Ar Mor Logistique */
  labs: [
    { id: 'L1', m: 'itn:2', xp: 120, title: 'Le premier switch de l\'entrepôt',
      story: 'Ar Mor Logistique, transporteur basé au port de Brest, t\'embauche pour monter le réseau de son nouvel entrepôt. Premier jour : un switch 2960 tout neuf, un PC, et le directeur qui veut « que ce soit sécurisé ».',
      topo: 'PC-A (192.168.10.10/24, passerelle .1) ── Fa0/1  AML-S1',
      goals: ['Nom d\'hôte AML-S1', 'enable secret', 'Mot de passe console + login', 'Mot de passe VTY 0 15 + login',
        'Chiffrer les mots de passe en clair', 'Bannière MOTD', 'SVI VLAN 1 : 192.168.10.2/24, activée', 'Passerelle par défaut 192.168.10.1', 'Sauvegarder la config'],
      hints: ['La SVI se configure avec « interface vlan 1 » et doit être en « no shutdown ».', '« service password-encryption » chiffre les mots de passe de type 7.', 'Pense à « copy running-config startup-config » à la fin.'],
      steps: [{ cmd: 'show running-config', on: 'AML-S1', checks: [
        { l: 'Nom d\'hôte AML-S1', re: /^hostname AML-S1\s*$/mi },
        { l: 'enable secret', re: /^enable secret (\d+ )?\S+/mi },
        { l: 'Chiffrement des mots de passe', re: /^service password-encryption/mi },
        { l: 'Bannière MOTD', re: /^banner motd/mi },
        { l: 'SVI VLAN 1 en 192.168.10.2/24', block: [/^interface Vlan1\s*$/mi, /ip address 192\.168\.10\.2 255\.255\.255\.0/i] },
        { l: 'SVI VLAN 1 activée', block: [/^interface Vlan1\s*$/mi, null, /^\s*shutdown/mi] },
        { l: 'Passerelle par défaut', re: /^ip default-gateway 192\.168\.10\.1\s*$/mi },
        { l: 'Console protégée', block: [/^line con 0\s*$/mi, /^\s*password/mi], also: /^\s*login\s*$/mi },
        { l: 'VTY protégées', block: [/^line vty 0 (4|15)\s*$/mi, /^\s*login/mi] }] }] },

    { id: 'L2', m: 'itn:10', xp: 150, title: 'Un routeur pour deux halls',
      story: 'L\'entrepôt a deux halls : les bureaux et la zone de stockage. Le directeur veut les séparer en deux réseaux. Tu reçois un routeur ISR 4321.',
      topo: 'PC-A ── AML-S1 ── G0/0/0  AML-R1  G0/0/1 ── AML-S2 ── PC-B\nLAN Bureau 192.168.10.0/24 · LAN Stockage 192.168.11.0/24',
      goals: ['Nom d\'hôte AML-R1, enable secret, console, VTY, bannière', 'G0/0/0 : 192.168.10.1/24, description LAN-BUREAU', 'G0/0/1 : 192.168.11.1/24, description LAN-STOCKAGE',
        'Interfaces actives', 'PC-B en 192.168.11.10/24, passerelle 192.168.11.1'],
      hints: ['Les interfaces d\'un routeur sont éteintes par défaut : « no shutdown ».', 'Vérifie avec « show ip interface brief » que Status et Protocol sont « up ».'],
      steps: [
        { cmd: 'show ip interface brief', on: 'AML-R1', checks: [
          { l: 'G0/0/0 en 192.168.10.1, up/up', re: /GigabitEthernet0\/0\/0\s+192\.168\.10\.1\s+YES\s+\S+\s+up\s+up/i },
          { l: 'G0/0/1 en 192.168.11.1, up/up', re: /GigabitEthernet0\/0\/1\s+192\.168\.11\.1\s+YES\s+\S+\s+up\s+up/i }] },
        { cmd: 'show running-config', on: 'AML-R1', checks: [
          { l: 'Nom d\'hôte AML-R1', re: /^hostname AML-R1\s*$/mi },
          { l: 'Description LAN-BUREAU', block: [/^interface GigabitEthernet0\/0\/0\s*$/mi, /description LAN-BUREAU/i] },
          { l: 'Description LAN-STOCKAGE', block: [/^interface GigabitEthernet0\/0\/1\s*$/mi, /description LAN-STOCKAGE/i] },
          { l: 'Bannière MOTD', re: /^banner motd/mi },
          { l: 'enable secret', re: /^enable secret (\d+ )?\S+/mi }] }] },

    { id: 'L3', m: 'itn:11', xp: 140, mobile: true, title: 'Plan d\'adressage de l\'agence de Quimper',
      story: 'Ar Mor ouvre une agence à Quimper. On te confie le bloc 192.168.20.0/24 à découper en VLSM, sans gaspiller. Ce labo se fait sur papier : parfait dans le train.',
      topo: 'Besoins : Production 100 hôtes · Bureaux 50 hôtes · Wi-Fi invités 20 hôtes · Lien WAN vers Brest 2 hôtes',
      goals: ['Commencer par le plus gros besoin', 'Donner chaque sous-réseau en notation réseau/préfixe', 'Donner la première adresse utilisable (la passerelle)'],
      hints: ['100 hôtes → il faut 7 bits d\'hôte (126 adresses utilisables) → /25.', 'Enchaîne les blocs sans trou : le suivant commence juste après le broadcast du précédent.'],
      form: [
        { l: 'Production — réseau/préfixe', a: '192.168.20.0/25' }, { l: 'Production — 1re adresse', a: '192.168.20.1' },
        { l: 'Bureaux — réseau/préfixe', a: '192.168.20.128/26' }, { l: 'Bureaux — 1re adresse', a: '192.168.20.129' },
        { l: 'Invités — réseau/préfixe', a: '192.168.20.192/27' }, { l: 'Invités — 1re adresse', a: '192.168.20.193' },
        { l: 'WAN — réseau/préfixe', a: '192.168.20.224/30' }, { l: 'WAN — 1re adresse', a: '192.168.20.225' }] },

    { id: 'L4', m: 'itn:12', xp: 150, title: 'Passage à l\'IPv6',
      story: 'Le client principal d\'Ar Mor, un armateur, exige l\'IPv6 sur les accès de ses prestataires. Tu passes l\'entrepôt de Brest en double pile.',
      topo: 'Même topologie que « Un routeur pour deux halls »\nLAN Bureau 2001:db8:acad:10::/64 · LAN Stockage 2001:db8:acad:11::/64',
      goals: ['Activer le routage IPv6', 'G0/0/0 : 2001:db8:acad:10::1/64 + link-local fe80::1', 'G0/0/1 : 2001:db8:acad:11::1/64 + link-local fe80::1', 'PC en configuration automatique (SLAAC)'],
      hints: ['Sans « ipv6 unicast-routing », le routeur n\'envoie pas de RA et les PC n\'obtiennent pas d\'adresse en SLAAC.', 'Une même link-local peut être utilisée sur plusieurs interfaces : elle n\'est valable que sur son lien.'],
      steps: [
        { cmd: 'show ipv6 interface brief', on: 'AML-R1', checks: [
          { l: 'G0/0/0 up/up, FE80::1 et 2001:DB8:ACAD:10::1', re: /GigabitEthernet0\/0\/0\s+\[up\/up\]\s+FE80::1\s+2001:DB8:ACAD:10::1/i },
          { l: 'G0/0/1 up/up, FE80::1 et 2001:DB8:ACAD:11::1', re: /GigabitEthernet0\/0\/1\s+\[up\/up\]\s+FE80::1\s+2001:DB8:ACAD:11::1/i }] },
        { cmd: 'show running-config | include ipv6 unicast', on: 'AML-R1', checks: [
          { l: 'Routage IPv6 activé', re: /^ipv6 unicast-routing/mi }] }] },

    { id: 'L5', m: 'itn:16', xp: 160, title: 'Fermer la porte aux curieux',
      story: 'Un audit commandé par l\'RSSI de l\'armateur pointe du Telnet en clair et des mots de passe faibles. Tu as jusqu\'à vendredi pour sécuriser l\'administration de AML-R1.',
      topo: 'AML-R1 administré depuis PC-A (192.168.10.10)',
      goals: ['Domaine armor.bzh, clés RSA 2048 bits', 'Utilisateur local admin avec secret', 'SSH version 2', 'VTY : SSH uniquement, login local, timeout 5 min',
        '10 caractères minimum pour les mots de passe', 'Blocage 120 s après 3 échecs en 60 s', 'Tester : ssh -l admin 192.168.10.1 depuis PC-A'],
      hints: ['Les clés RSA demandent un nom d\'hôte et un nom de domaine configurés.', '« exec-timeout 5 0 » sur les lignes VTY.'],
      steps: [
        { cmd: 'show running-config', on: 'AML-R1', checks: [
          { l: 'Domaine armor.bzh', re: /^ip domain[- ]name armor\.bzh/mi },
          { l: 'Utilisateur admin', re: /^username admin (privilege \d+ )?secret/mi },
          { l: 'SSH version 2', re: /^ip ssh version 2/mi },
          { l: 'VTY en SSH seulement', block: [/^line vty 0 4\s*$/mi, /transport input ssh\s*$/mi] },
          { l: 'VTY en login local', block: [/^line vty 0 4\s*$/mi, /login local/mi] },
          { l: 'Timeout 5 min', block: [/^line vty 0 4\s*$/mi, /exec-timeout 5 0/mi] },
          { l: 'Longueur mini 10', re: /^security passwords min-length 10/mi },
          { l: 'Anti-bruteforce', re: /^login block-for 120 attempts 3 within 60/mi }] },
        { cmd: 'show ip ssh', on: 'AML-R1', checks: [
          { l: 'SSH activé en v2', re: /SSH Enabled - version 2\.0/i }] }] },

    { id: 'L6', m: 'itn:17', xp: 200, title: 'Inauguration de l\'entrepôt',
      story: 'Demain, inauguration avec le directeur et le client. Tout doit communiquer. Dernière vérification de bout en bout avant de rendre les clés.',
      topo: 'PC-A 192.168.10.10 ── AML-S1 ── AML-R1 ── AML-S2 ── PC-B 192.168.11.10',
      goals: ['PC-A joint PC-B (ping)', 'Table de routage de AML-R1 correcte', 'Configs sauvegardées sur tous les équipements'],
      hints: ['Si le ping échoue : passerelles des PC, état des interfaces, masques.', 'Le premier ping peut perdre un paquet le temps de la résolution ARP.'],
      steps: [
        { cmd: 'ping 192.168.11.10', on: 'PC-A', checks: [
          { l: 'Réponse de PC-B à travers un routeur (TTL 127)', re: /Reply from 192\.168\.11\.10:.*TTL=127/i }] },
        { cmd: 'show ip route', on: 'AML-R1', checks: [
          { l: 'C 192.168.10.0/24', re: /C\s+192\.168\.10\.0\/24 is directly connected/i },
          { l: 'L 192.168.10.1/32', re: /L\s+192\.168\.10\.1\/32 is directly connected/i },
          { l: 'C 192.168.11.0/24', re: /C\s+192\.168\.11\.0\/24 is directly connected/i },
          { l: 'L 192.168.11.1/32', re: /L\s+192\.168\.11\.1\/32 is directly connected/i }] }] }
  ],

  ranks: ['Stagiaire réseau', 'Technicien N1', 'Technicien N2', 'Technicien réseau', 'Admin réseau', 'Admin confirmé', 'Ingénieur réseau', 'Ingénieur senior', 'Architecte réseau', 'Prêt pour le CCNA'],

  defaultRewards: [
    { id: 'r1', name: 'Session multi avec les potes, sans regarder l\'heure', cost: 150 },
    { id: 'r2', name: 'Soirée jeu sans limite', cost: 300 },
    { id: 'r3', name: 'M\'offrir un nouveau jeu', cost: 1500 }
  ]
};

if (typeof module !== 'undefined') module.exports = DATA;
