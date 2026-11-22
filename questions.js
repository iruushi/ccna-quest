/* Banque de QCM (v1.6). Format : [module, question, [BONNE RÉPONSE, mauvaise, mauvaise, mauvaise], explication]
   La bonne réponse est toujours écrite en premier : l'appli mélange les options à l'affichage. */
const QBANK = [
  // ===== ITN 1 · Les réseaux aujourd'hui
  ["itn:1", "Quel type de réseau couvre un bâtiment ou un campus et appartient à l'entreprise ?", ["LAN", "WAN", "MAN", "Internet"], "Un LAN couvre une zone géographique limitée et est administré par l'organisation elle-même."],
  ["itn:1", "Un réseau qui continue de fonctionner grâce à plusieurs chemins possibles a quelle qualité ?", ["Tolérance aux pannes", "Évolutivité", "Qualité de service", "Convergence"], "La redondance des chemins permet de contourner une panne : c'est la tolérance aux pannes."],
  ["itn:1", "Ar Mor ouvre une partie de son réseau à ses transporteurs partenaires. Comment s'appelle cette zone ?", ["Extranet", "Intranet", "Internet", "DMZ"], "Un extranet donne un accès contrôlé à des organisations extérieures, contrairement à l'intranet réservé à l'interne."],
  ["itn:1", "Que désigne BYOD ?", ["Les employés utilisent leurs propres appareils au travail", "Un protocole de sauvegarde", "Un type de câble", "Une méthode de chiffrement"], "Bring Your Own Device : chacun apporte son portable ou son téléphone, ce qui complique la sécurité."],
  ["itn:1", "Un réseau capable d'accueillir de nouveaux utilisateurs sans dégrader le service est…", ["Évolutif", "Convergent", "Tolérant aux pannes", "Sécurisé"], "L'évolutivité (scalability) permet de grandir sans tout reconcevoir."],

  // ===== ITN 2 · Configuration de base
  ["itn:2", "Quel mode IOS correspond à l'invite Switch# ?", ["Mode d'exécution privilégié", "Mode d'exécution utilisateur", "Mode de configuration globale", "Mode de configuration d'interface"], "Switch> = utilisateur, Switch# = privilégié, Switch(config)# = configuration globale."],
  ["itn:2", "Quelle commande passe du mode privilégié au mode de configuration globale ?", ["configure terminal", "enable", "interface", "login"], "« conf t » depuis Switch# donne Switch(config)#."],
  ["itn:2", "Où est stockée la running-config ?", ["En RAM", "En NVRAM", "En flash", "En ROM"], "La config active est en RAM : elle est perdue au redémarrage si elle n'est pas sauvegardée."],
  ["itn:2", "Où est stockée la startup-config ?", ["En NVRAM", "En RAM", "En ROM", "Sur un serveur TFTP uniquement"], "La NVRAM garde la configuration de démarrage même sans alimentation."],
  ["itn:2", "Quelle touche complète une commande IOS partiellement tapée ?", ["Tab", "Ctrl+Z", "Échap", "?"], "Tab complète la commande, ? affiche l'aide contextuelle, Ctrl+Z revient en mode privilégié."],
  ["itn:2", "Comment annuler une commande de configuration sur IOS ?", ["La retaper précédée de « no »", "Avec « undo »", "Avec « delete »", "Avec « clear »"], "Ex. : « no shutdown », « no ip address »."],

  // ===== ITN 3 · Protocoles et modèles
  ["itn:3", "Combien de couches compte le modèle TCP/IP ?", ["4", "7", "5", "3"], "Application, transport, Internet, accès réseau. Le modèle OSI en compte 7."],
  ["itn:3", "À quelle couche OSI opère un switch classique ?", ["Couche 2 (liaison de données)", "Couche 1 (physique)", "Couche 3 (réseau)", "Couche 4 (transport)"], "Il commute sur les adresses MAC, donc en couche 2."],
  ["itn:3", "Quel organisme normalise Ethernet et le Wi-Fi ?", ["L'IEEE", "L'IETF", "L'ICANN", "L'ISO"], "IEEE 802.3 pour Ethernet, 802.11 pour le Wi-Fi. L'IETF produit les RFC (TCP/IP)."],
  ["itn:3", "Chez le destinataire, la désencapsulation se fait…", ["De la couche physique vers la couche application", "De la couche application vers la couche physique", "Uniquement en couche 3", "Dans un ordre aléatoire"], "L'émetteur encapsule de haut en bas, le récepteur retire les en-têtes de bas en haut."],
  ["itn:3", "Quelle couche OSI gère le chiffrement et le format des données ?", ["Présentation (6)", "Session (5)", "Transport (4)", "Application (7)"], "La couche présentation traite le format, la compression et le chiffrement."],

  // ===== ITN 4 · Couche physique
  ["itn:4", "Quelle est la longueur maximale d'un câble Ethernet cuivre (Cat 5e/6) ?", ["100 m", "50 m", "185 m", "500 m"], "100 m par segment pour l'Ethernet sur paires torsadées."],
  ["itn:4", "Quelle fibre choisir pour une liaison de plusieurs kilomètres ?", ["Monomode", "Multimode", "Cuivre Cat 6a", "Coaxial"], "La monomode (laser, cœur fin) porte bien plus loin que la multimode (LED, cœur plus large)."],
  ["itn:4", "Comment s'appelle l'interférence d'une paire de fils sur sa voisine ?", ["La diaphonie (crosstalk)", "L'atténuation", "La latence", "La gigue"], "Le torsadage des paires limite la diaphonie."],
  ["itn:4", "Quelle mesure exclut l'overhead des en-têtes et donne les données vraiment utiles transférées ?", ["Le débit applicatif (goodput)", "La bande passante", "Le débit (throughput)", "La latence"], "Bande passante = capacité théorique, débit = mesuré, goodput = données utiles uniquement."],
  ["itn:4", "Quel câble relie le port COM/USB d'un PC au port console d'un switch ?", ["Un câble console (rollover)", "Un câble croisé", "Une fibre monomode", "Un câble coaxial"], "Le câble console sert à l'accès hors bande pour la configuration initiale."],

  // ===== ITN 5 · Systèmes de numération
  ["itn:5", "Combien de bits représente un chiffre hexadécimal ?", ["4", "8", "2", "16"], "Un chiffre hexa = un quartet (nibble) de 4 bits, de 0000 (0) à 1111 (F)."],
  ["itn:5", "Quelle est la valeur du bit de poids fort d'un octet ?", ["128", "256", "255", "64"], "Poids d'un octet : 128 64 32 16 8 4 2 1."],
  ["itn:5", "Combien de bits compte une adresse IPv6 ?", ["128", "32", "64", "48"], "IPv4 = 32 bits, MAC = 48 bits, IPv6 = 128 bits."],
  ["itn:5", "Combien vaut 11111111 en décimal ?", ["255", "256", "128", "511"], "128+64+32+16+8+4+2+1 = 255."],

  // ===== ITN 6 · Couche liaison de données
  ["itn:6", "Quelles sont les deux sous-couches de la couche liaison de données ?", ["LLC et MAC", "TCP et UDP", "IP et ICMP", "PHY et PMD"], "LLC dialogue avec la couche réseau, MAC gère l'adressage et l'accès au support."],
  ["itn:6", "Quelle méthode d'accès utilise l'Ethernet en half-duplex ?", ["CSMA/CD", "CSMA/CA", "Passage de jeton", "TDMA"], "Détection de collision en Ethernet half-duplex ; le Wi-Fi utilise CSMA/CA (évitement)."],
  ["itn:6", "Quel champ de la trame Ethernet indique le protocole de couche 3 transporté ?", ["EtherType", "FCS", "Préambule", "TTL"], "0x0800 = IPv4, 0x86DD = IPv6, 0x0806 = ARP."],
  ["itn:6", "Quelle méthode d'accès utilise le Wi-Fi ?", ["CSMA/CA", "CSMA/CD", "Passage de jeton", "Polling"], "En sans-fil on ne peut pas détecter les collisions : on cherche à les éviter."],

  // ===== ITN 7 · Commutation Ethernet
  ["itn:7", "Quelle est la taille minimale d'une trame Ethernet ?", ["64 octets", "46 octets", "1518 octets", "128 octets"], "Une trame plus petite (runt) est rejetée. Taille max standard : 1518 octets."],
  ["itn:7", "Quelle est l'adresse MAC de broadcast ?", ["FF-FF-FF-FF-FF-FF", "00-00-00-00-00-00", "01-00-5E-00-00-01", "FF-FF-FF-00-00-00"], "Tous les bits à 1 : la trame est reçue par tous les hôtes du domaine de broadcast."],
  ["itn:7", "Quelle méthode de commutation reçoit toute la trame et vérifie le FCS avant de la transmettre ?", ["Store-and-forward", "Cut-through fast-forward", "Fragment-free", "Flooding"], "Store-and-forward rejette les trames corrompues, au prix d'un peu de latence."],
  ["itn:7", "Comment un switch remplit-il sa table d'adresses MAC ?", ["Avec l'adresse MAC source des trames reçues", "Avec l'adresse MAC de destination", "Grâce aux requêtes ARP", "Grâce au DHCP"], "Il associe la MAC source au port d'arrivée."],
  ["itn:7", "À quoi sert l'auto-MDIX ?", ["À détecter automatiquement le type de câble (droit ou croisé)", "À choisir automatiquement le VLAN", "À chiffrer le trafic", "À négocier l'adresse IP"], "Plus besoin de choisir câble droit ou croisé entre deux équipements."],

  // ===== ITN 8 · Couche réseau
  ["itn:8", "Quel champ de l'en-tête IPv4 empêche un paquet de tourner indéfiniment ?", ["TTL", "Checksum", "ToS", "Identification"], "Chaque routeur décrémente le TTL ; à 0, le paquet est détruit. En IPv6 : Hop Limit."],
  ["itn:8", "Quelles caractéristiques décrivent IP ?", ["Sans connexion et au mieux (best effort)", "Orienté connexion et fiable", "Fiable avec accusés de réception", "Chiffré par défaut"], "IP ne garantit ni la livraison ni l'ordre : c'est le rôle de TCP."],
  ["itn:8", "Quelle est la taille de l'en-tête IPv6 de base ?", ["40 octets, fixe", "20 octets, variable", "60 octets", "32 octets"], "En-tête simplifié et de taille fixe, les options passent en en-têtes d'extension."],
  ["itn:8", "Quelle commande Windows affiche la table de routage du PC ?", ["route print", "ipconfig /all", "arp -a", "nslookup"], "« netstat -r » donne aussi le même résultat."],

  // ===== ITN 9 · Résolution d'adresse
  ["itn:9", "Quel mécanisme remplace ARP en IPv6 ?", ["NDP (messages ICMPv6 NS/NA)", "RARP", "DHCPv6", "DNS"], "Neighbor Discovery : Neighbor Solicitation et Neighbor Advertisement."],
  ["itn:9", "Comment est envoyée une requête ARP ?", ["En broadcast, et la réponse en unicast", "En unicast, et la réponse en broadcast", "En multicast", "Vers le serveur DHCP"], "Tout le monde reçoit la question, seul le propriétaire de l'IP répond."],
  ["itn:9", "Quelle commande Windows affiche le cache ARP ?", ["arp -a", "ipconfig /displaydns", "netstat -an", "route print"], "Elle liste les correspondances IP → MAC connues."],
  ["itn:9", "Un attaquant répond aux requêtes ARP avec sa propre MAC pour la passerelle. Comment s'appelle l'attaque ?", ["Empoisonnement ARP (ARP spoofing)", "DHCP starvation", "VLAN hopping", "Débordement de table MAC"], "Il se place ainsi au milieu des échanges (on-path). Contre-mesure : DAI."],

  // ===== ITN 10 · Configuration de base d'un routeur
  ["itn:10", "Dans quel état sont les interfaces d'un routeur neuf ?", ["Administrativement désactivées", "Actives en DHCP", "Actives sans IP", "En mode trunk"], "Il faut un « no shutdown » sur chaque interface utilisée."],
  ["itn:10", "Pourquoi un PC a-t-il besoin d'une passerelle par défaut ?", ["Pour joindre les réseaux distants", "Pour obtenir son adresse MAC", "Pour résoudre les noms", "Pour joindre les hôtes de son propre LAN"], "Tout ce qui n'est pas dans son sous-réseau est envoyé à la passerelle."],
  ["itn:10", "Quelle commande affiche l'état et les adresses IPv6 des interfaces en résumé ?", ["show ipv6 interface brief", "show ip interface brief", "show ipv6 route", "show interfaces summary"], "L'équivalent IPv6 de « show ip interface brief »."],

  // ===== ITN 11 · Adressage IPv4
  ["itn:11", "Laquelle de ces adresses est privée (RFC 1918) ?", ["172.20.5.1", "172.32.1.1", "192.169.1.1", "11.0.0.1"], "Plages privées : 10.0.0.0/8, 172.16.0.0/12 (172.16 à 172.31) et 192.168.0.0/16."],
  ["itn:11", "Un PC sans réponse DHCP s'attribue 169.254.12.7. De quoi s'agit-il ?", ["D'une adresse APIPA (link-local IPv4)", "D'une adresse publique", "D'une adresse de loopback", "D'une adresse multicast"], "169.254.0.0/16 : le PC n'a pas trouvé de serveur DHCP."],
  ["itn:11", "Quelle adresse sert à tester la pile TCP/IP locale ?", ["127.0.0.1", "0.0.0.0", "255.255.255.255", "169.254.0.1"], "La plage 127.0.0.0/8 est réservée au loopback."],
  ["itn:11", "Comment s'appelle une transmission vers un groupe d'hôtes abonnés ?", ["Multicast", "Unicast", "Broadcast", "Anycast"], "Le multicast IPv4 utilise la plage 224.0.0.0/4."],

  // ===== ITN 12 · Adressage IPv6
  ["itn:12", "Quelle méthode permet à un hôte de créer son adresse IPv6 à partir des annonces du routeur, sans serveur ?", ["SLAAC", "DHCPv6 avec état", "APIPA", "NAT64"], "Stateless Address Autoconfiguration : préfixe reçu dans le RA + identifiant d'interface."],
  ["itn:12", "Quelle longueur de préfixe utilise-t-on normalement pour un LAN IPv6 ?", ["/64", "/48", "/128", "/24"], "64 bits de réseau, 64 bits d'identifiant d'interface : c'est ce qu'attend SLAAC."],
  ["itn:12", "Quelle adresse multicast désigne tous les nœuds IPv6 du lien ?", ["ff02::1", "ff02::2", "fe80::1", "::1"], "ff02::1 = tous les nœuds, ff02::2 = tous les routeurs."],
  ["itn:12", "Quelle commande Windows affiche les adresses IPv6 du PC ?", ["ipconfig", "arp -a", "route print -6", "netsh wlan show"], "ipconfig liste les adresses link-local et globales de chaque carte."],

  // ===== ITN 13 · ICMP
  ["itn:13", "Quels messages ICMP utilise la commande ping ?", ["Echo Request et Echo Reply", "Time Exceeded", "Destination Unreachable", "Redirect"], "Ping envoie des Echo Request, la cible répond par des Echo Reply."],
  ["itn:13", "En IPv6, que fait un hôte qui vient de démarrer pour trouver le routeur ?", ["Il envoie un Router Solicitation (RS)", "Il envoie une requête ARP", "Il envoie un DHCPDISCOVER", "Il attend un ping"], "Le routeur répond par un Router Advertisement (RA)."],
  ["itn:13", "Quel message ICMP reçoit traceroute de chaque routeur intermédiaire ?", ["Time Exceeded", "Echo Reply", "Source Quench", "Parameter Problem"], "Le TTL expire à chaque saut, le routeur concerné renvoie Time Exceeded."],

  // ===== ITN 14 · Couche transport
  ["itn:14", "Dans quel ordre se déroule l'établissement d'une connexion TCP ?", ["SYN, SYN-ACK, ACK", "SYN, ACK, FIN", "ACK, SYN, SYN-ACK", "SYN, FIN, ACK"], "La poignée de main en trois temps."],
  ["itn:14", "Quelle est la plage des ports bien connus ?", ["0 à 1023", "1024 à 49151", "49152 à 65535", "0 à 65535"], "1024-49151 = ports enregistrés, 49152-65535 = ports dynamiques/privés."],
  ["itn:14", "Quel port utilise HTTPS ?", ["TCP 443", "TCP 80", "TCP 22", "UDP 53"], "80 = HTTP, 22 = SSH, 53 = DNS."],
  ["itn:14", "Quel mécanisme TCP évite de submerger un récepteur lent ?", ["Le fenêtrage (contrôle de flux)", "Le TTL", "Le checksum", "Le multiplexage"], "Le récepteur annonce la taille de fenêtre qu'il peut accepter."],
  ["itn:14", "Quel port utilise SSH ?", ["TCP 22", "TCP 23", "TCP 21", "UDP 161"], "23 = Telnet, 21 = FTP, 161 = SNMP."],

  // ===== ITN 15 · Couche application
  ["itn:15", "Quel protocole résout un nom comme armor.bzh en adresse IP ?", ["DNS", "DHCP", "ARP", "SNMP"], "Le DNS écoute sur le port 53 (UDP principalement, TCP aussi)."],
  ["itn:15", "Quel protocole envoie les e-mails entre serveurs ?", ["SMTP", "IMAP", "POP3", "HTTP"], "IMAP et POP3 servent à récupérer les mails côté client."],
  ["itn:15", "Quel type d'enregistrement DNS associe un nom à une adresse IPv6 ?", ["AAAA", "A", "MX", "CNAME"], "A = IPv4, MX = serveur de mail, CNAME = alias."],
  ["itn:15", "Dans quel modèle chaque appareil peut être à la fois client et serveur ?", ["Pair-à-pair (P2P)", "Client-serveur", "Hiérarchique", "Hub-and-spoke"], "Exemple : le partage de fichiers en BitTorrent."],

  // ===== ITN 16 · Sécurité réseau
  ["itn:16", "Un malware qui se propage seul de machine en machine sans action de l'utilisateur est…", ["Un ver", "Un virus", "Un cheval de Troie", "Un spyware"], "Le virus a besoin d'un programme hôte et d'une action ; le ver exploite seul des failles réseau."],
  ["itn:16", "Que signifie AAA ?", ["Authentification, autorisation, traçabilité", "Accès, audit, administration", "Antivirus, antispam, antimalware", "Adresse, agrégation, acheminement"], "Qui es-tu, qu'as-tu le droit de faire, qu'as-tu fait (accounting)."],
  ["itn:16", "Que fait un pare-feu à état (stateful) ?", ["Il suit les connexions et laisse passer les réponses légitimes", "Il filtre uniquement sur les adresses MAC", "Il chiffre tout le trafic", "Il bloque tout le trafic sortant"], "Il garde une table des sessions établies."],
  ["itn:16", "Un attaquant s'interpose entre deux hôtes et lit leurs échanges. Comment s'appelle l'attaque ?", ["Man-in-the-middle (on-path)", "Déni de service", "Reconnaissance", "Ping sweep"], "Il intercepte, et peut modifier, la communication."],

  // ===== ITN 17 · Petit réseau
  ["itn:17", "Quelle commande liste les équipements Cisco directement connectés ?", ["show cdp neighbors", "show ip route", "show arp", "show version"], "CDP est un protocole Cisco de couche 2 ; LLDP est son équivalent standard."],
  ["itn:17", "Avec l'approche de dépannage ascendante (bottom-up), par où commence-t-on ?", ["Par la couche physique", "Par la couche application", "Par la couche réseau", "Par la couche transport"], "Câbles, voyants, interfaces, puis on remonte."],
  ["itn:17", "Que n'affiche pas « show version » ?", ["La table de routage", "La version de l'IOS", "Le temps de fonctionnement (uptime)", "La quantité de mémoire"], "show version donne l'IOS, l'uptime, la mémoire, le registre de configuration et le modèle."],

  // ===== SRWE 1 · Configuration de base
  ["srwe:1", "Qu'est-ce qu'une trame « runt » ?", ["Une trame de moins de 64 octets", "Une trame de plus de 1518 octets", "Une trame en double", "Une trame sans adresse source"], "Souvent due à des collisions ou à un problème de duplex. Les « giants » sont trop grandes."],
  ["srwe:1", "Quelle commande vérifie la vitesse et le duplex d'une interface ?", ["show interfaces", "show vlan", "show cdp", "show flash"], "« show interfaces Fa0/1 » affiche duplex, vitesse et compteurs d'erreurs."],
  ["srwe:1", "Pourquoi configurer une SVI sur un switch de couche 2 ?", ["Pour l'administrer à distance", "Pour router entre VLAN", "Pour activer le STP", "Pour créer des VLAN"], "La SVI (interface vlan) porte l'IP de gestion du switch."],

  // ===== SRWE 2 · Concepts de commutation
  ["srwe:2", "Sur un switch, chaque port constitue…", ["Un domaine de collision distinct", "Un domaine de broadcast distinct", "Un sous-réseau distinct", "Un VLAN distinct"], "Un switch segmente les domaines de collision, pas les domaines de broadcast."],
  ["srwe:2", "Quel équipement délimite un domaine de broadcast ?", ["Un routeur", "Un switch de couche 2", "Un hub", "Un répéteur"], "Les VLAN segmentent aussi le broadcast sur un switch."],
  ["srwe:2", "Un switch reçoit une trame broadcast. Que fait-il ?", ["Il l'envoie sur tous les ports du VLAN sauf le port d'entrée", "Il la détruit", "Il l'envoie au routeur uniquement", "Il l'envoie sur tous les VLAN"], "Le broadcast reste confiné à son VLAN."],

  // ===== SRWE 3 · VLAN
  ["srwe:3", "Quel est le VLAN par défaut sur un switch Cisco ?", ["VLAN 1", "VLAN 0", "VLAN 99", "VLAN 1002"], "Tous les ports y sont au départ. Bonne pratique : ne pas l'utiliser pour les utilisateurs."],
  ["srwe:3", "Quelle est la plage des VLAN étendus ?", ["1006 à 4094", "1 à 1005", "1 à 4096", "100 à 999"], "1 à 1005 = plage normale, 1002 à 1005 réservés aux anciennes technologies."],
  ["srwe:3", "Quelle taille fait l'étiquette 802.1Q ajoutée à la trame ?", ["4 octets", "2 octets", "8 octets", "12 bits"], "Elle contient entre autres l'ID de VLAN sur 12 bits et la priorité (PCP) sur 3 bits."],
  ["srwe:3", "Comment circule le trafic du VLAN natif sur un trunk 802.1Q ?", ["Sans étiquette", "Avec une double étiquette", "Chiffré", "Il ne circule pas"], "C'est pourquoi le VLAN natif doit être identique aux deux extrémités."],
  ["srwe:3", "Deux ports reliés sont en « switchport mode dynamic auto ». Que devient le lien ?", ["Il reste en mode accès", "Il passe en trunk", "Il passe en err-disabled", "Il passe en EtherChannel"], "Deux côtés passifs (auto) ne négocient jamais le trunk. Il faut au moins un « desirable » ou « trunk »."],
  ["srwe:3", "Quelle commande affiche les trunks et les VLAN autorisés ?", ["show interfaces trunk", "show vlan brief", "show ip interface brief", "show spanning-tree"], "« show vlan brief » ne liste pas les ports trunk."],

  // ===== SRWE 4 · Routage inter-VLAN
  ["srwe:4", "Quelle commande active le routage sur un switch multicouche ?", ["ip routing", "ipv6 unicast-routing", "router ospf 1", "switchport mode trunk"], "Sans « ip routing », les SVI ne routent pas entre elles."],
  ["srwe:4", "Quel est le principal inconvénient du routeur-on-a-stick ?", ["Un seul lien physique devient un goulot d'étranglement", "Il ne supporte pas 802.1Q", "Il demande un port par VLAN", "Il ne fonctionne pas avec DHCP"], "Tout le trafic inter-VLAN monte et redescend par le même lien."],
  ["srwe:4", "Quelle solution de routage inter-VLAN est la plus performante en entreprise ?", ["Les SVI sur un switch de couche 3", "Le routeur-on-a-stick", "Un routeur avec un port par VLAN", "Le routage par le pare-feu"], "Le routage se fait en matériel, à la vitesse du switch."],

  // ===== SRWE 5 · STP
  ["srwe:5", "Quelle est la priorité de pont par défaut ?", ["32768", "4096", "0", "65535"], "La priorité se règle par pas de 4096 (avec l'ID de VLAN ajouté en PVST+)."],
  ["srwe:5", "Quel port d'un switch non racine offre le meilleur chemin vers le pont racine ?", ["Le port racine (root port)", "Le port désigné", "Le port alternatif", "Le port de secours"], "Chaque switch non racine a exactement un port racine."],
  ["srwe:5", "Dans quel ordre passe un port STP 802.1D avant de transmettre ?", ["Blocking, listening, learning, forwarding", "Listening, blocking, learning, forwarding", "Learning, listening, forwarding", "Blocking, learning, forwarding"], "Environ 30 à 50 s : c'est pourquoi RSTP a été créé."],
  ["srwe:5", "Sur quels ports activer PortFast ?", ["Les ports d'accès vers des hôtes", "Les trunks entre switchs", "Tous les ports", "Les ports racine"], "Sur un lien entre switchs, PortFast risquerait de créer une boucle."],
  ["srwe:5", "Que fait BPDU Guard quand un port PortFast reçoit une BPDU ?", ["Il passe le port en err-disabled", "Il en fait le pont racine", "Il ignore la BPDU", "Il passe le port en trunk"], "Protection contre un switch branché sur un port utilisateur."],
  ["srwe:5", "Sur quelle norme repose Rapid PVST+ ?", ["802.1w (RSTP)", "802.1D", "802.1s", "802.1Q"], "RSTP converge en quelques secondes. 802.1s = MSTP."],

  // ===== SRWE 6 · EtherChannel
  ["srwe:6", "Quel protocole d'EtherChannel est un standard IEEE ?", ["LACP", "PAgP", "DTP", "VTP"], "PAgP est propriétaire Cisco."],
  ["srwe:6", "Deux côtés en LACP « passive ». Que se passe-t-il ?", ["Aucun EtherChannel ne se forme", "L'EtherChannel se forme", "Les ports passent en err-disabled", "Le lien passe en trunk"], "Il faut au moins un côté en « active »."],
  ["srwe:6", "Combien de liens actifs au maximum dans un EtherChannel LACP ?", ["8", "2", "4", "16"], "LACP accepte jusqu'à 16 liens, dont 8 actifs et 8 en attente."],
  ["srwe:6", "Quelle condition est obligatoire pour regrouper des ports en EtherChannel ?", ["Même vitesse, même duplex et même configuration VLAN", "Des numéros de port qui se suivent", "Le même câble de marque", "Des adresses IP différentes"], "Une seule différence et le port est suspendu du bundle."],

  // ===== SRWE 7 · DHCPv4
  ["srwe:7", "Quelle commande empêche le routeur de distribuer certaines adresses ?", ["ip dhcp excluded-address", "ip dhcp pool", "ip helper-address", "no ip dhcp"], "À configurer pour les adresses fixes : passerelle, serveurs, imprimantes."],
  ["srwe:7", "Quelle commande affiche les baux DHCP attribués par le routeur ?", ["show ip dhcp binding", "show ip dhcp pool", "show dhcp lease", "show ip interface"], "Elle liste les correspondances IP ↔ MAC."],
  ["srwe:7", "Sur quel port écoute un client DHCPv4 ?", ["UDP 68", "UDP 67", "TCP 68", "UDP 53"], "Serveur = UDP 67, client = UDP 68."],

  // ===== SRWE 8 · SLAAC et DHCPv6
  ["srwe:8", "Un RA a le flag M à 1. Que doit faire l'hôte ?", ["Obtenir son adresse auprès d'un serveur DHCPv6 avec état", "Utiliser SLAAC uniquement", "Utiliser une adresse APIPA", "Ignorer le RA"], "M (managed) = DHCPv6 avec état. O (other) = SLAAC + autres infos par DHCPv6 sans état."],
  ["srwe:8", "À quoi sert la DAD en IPv6 ?", ["À vérifier qu'une adresse n'est pas déjà utilisée sur le lien", "À distribuer les DNS", "À calculer l'EUI-64", "À chiffrer l'adresse"], "Duplicate Address Detection, via un Neighbor Solicitation vers sa propre adresse."],
  ["srwe:8", "Un RA a les flags M=0 et O=1. Comment l'hôte se configure-t-il ?", ["SLAAC pour l'adresse, DHCPv6 sans état pour le DNS", "DHCPv6 avec état pour tout", "Adresse manuelle obligatoire", "Uniquement une link-local"], "C'est le mode « DHCPv6 sans état »."],

  // ===== SRWE 9 · FHRP
  ["srwe:9", "À quoi sert un protocole FHRP comme HSRP ?", ["À fournir une passerelle par défaut redondante", "À éviter les boucles de couche 2", "À agréger des liens", "À distribuer des adresses"], "Les hôtes pointent vers une IP virtuelle portée par le routeur actif."],
  ["srwe:9", "Comment est élu le routeur actif HSRP ?", ["Par la priorité la plus haute (100 par défaut)", "Par l'adresse MAC la plus basse", "Par l'IP la plus basse", "Au hasard"], "En cas d'égalité, l'IP la plus haute l'emporte."],
  ["srwe:9", "Quel FHRP est un standard ouvert ?", ["VRRP", "HSRP", "GLBP", "CDP"], "HSRP et GLBP sont propriétaires Cisco ; GLBP fait aussi de la répartition de charge."],
  ["srwe:9", "Que permet la commande « standby 1 preempt » ?", ["Au routeur de priorité plus haute de reprendre le rôle actif", "De désactiver HSRP", "De changer l'IP virtuelle", "D'activer l'authentification"], "Sans preempt, un routeur qui revient ne reprend pas la main."],

  // ===== SRWE 10 · Sécurité LAN
  ["srwe:10", "Quelle attaque vise à remplir la table MAC d'un switch pour qu'il inonde tout ?", ["Le débordement de table MAC", "Le DHCP spoofing", "Le VLAN hopping", "L'ARP spoofing"], "Contre-mesure : port-security."],
  ["srwe:10", "Quelle fonction protège contre les faux serveurs DHCP ?", ["DHCP snooping", "Port-security", "BPDU Guard", "PortFast"], "Seuls les ports « trusted » peuvent envoyer des réponses DHCP."],
  ["srwe:10", "Quelle fonction bloque l'empoisonnement ARP ?", ["DAI (Dynamic ARP Inspection)", "DHCP relay", "STP", "LLDP"], "DAI s'appuie sur la table de DHCP snooping."],
  ["srwe:10", "Comment limiter l'attaque VLAN hopping par double étiquetage ?", ["Utiliser un VLAN natif dédié et inutilisé", "Utiliser le VLAN 1 comme natif", "Activer DTP partout", "Désactiver STP"], "Et passer les ports d'accès en « switchport mode access »."],
  ["srwe:10", "En 802.1X, quel rôle joue le switch ?", ["Authentificateur", "Supplicant", "Serveur d'authentification", "Client"], "Le PC est le supplicant, le serveur RADIUS est le serveur d'authentification."],

  // ===== SRWE 11 · Sécurité des switchs
  ["srwe:11", "Quel mode de violation port-security jette le trafic sans journaliser ?", ["protect", "restrict", "shutdown", "drop"], "restrict jette et incrémente un compteur avec un log ; shutdown met le port en err-disabled."],
  ["srwe:11", "Comment déclarer un port comme fiable pour le DHCP snooping ?", ["ip dhcp snooping trust", "ip dhcp snooping limit", "switchport trust", "ip dhcp trusted"], "On le fait sur le port vers le vrai serveur DHCP et les uplinks."],
  ["srwe:11", "Comment réactiver à la main un port en err-disabled ?", ["shutdown puis no shutdown", "clear mac address-table", "reload", "no switchport"], "Ou automatiquement avec « errdisable recovery »."],
  ["srwe:11", "Quelle commande affiche l'état de port-security d'un port ?", ["show port-security interface f0/5", "show mac address-table", "show running-config | include vlan", "show ip dhcp snooping"], "Elle montre le mode de violation, le compteur et les MAC apprises."],

  // ===== SRWE 12 · Concepts WLAN
  ["srwe:12", "Quels canaux 2,4 GHz ne se chevauchent pas ?", ["1, 6 et 11", "1, 2 et 3", "1, 5 et 9", "2, 7 et 12"], "En 2,4 GHz, seuls trois canaux de 20 MHz sont indépendants (en Amérique du Nord comme en Europe)."],
  ["srwe:12", "Quelle norme correspond au Wi-Fi 6 ?", ["802.11ax", "802.11ac", "802.11n", "802.11g"], "Wi-Fi 4 = 802.11n, Wi-Fi 5 = 802.11ac."],
  ["srwe:12", "Quel protocole relie les points d'accès légers à leur contrôleur WLC ?", ["CAPWAP", "LACP", "HSRP", "SNMP"], "CAPWAP transporte la configuration et, souvent, les données des clients."],
  ["srwe:12", "Quelle sécurité Wi-Fi est la plus récente et la plus robuste ?", ["WPA3", "WPA2", "WPA", "WEP"], "WEP et WPA sont cassés, WPA2 reste courant, WPA3 apporte SAE."],

  // ===== SRWE 13 · Configuration WLAN
  ["srwe:13", "Avec WPA2 Personnel, comment s'authentifient les clients ?", ["Avec une clé partagée (PSK)", "Avec un serveur RADIUS", "Avec un certificat obligatoire", "Sans authentification"], "Le mode Entreprise utilise 802.1X avec un serveur RADIUS."],
  ["srwe:13", "Quel élément est indispensable pour le WPA2 Entreprise ?", ["Un serveur RADIUS", "Un serveur DHCPv6", "Un serveur TFTP", "Un serveur NTP"], "Chaque utilisateur a ses propres identifiants."],
  ["srwe:13", "Qu'est-ce que le SSID ?", ["Le nom du réseau sans fil", "La clé de chiffrement", "L'adresse MAC du point d'accès", "Le numéro de canal"], "Le cacher n'apporte presque aucune sécurité."],

  // ===== SRWE 14 · Concepts de routage
  ["srwe:14", "Que signifie le code « S » dans une table de routage ?", ["Route statique", "Route via un switch", "Route SLAAC", "Route de secours"], "C = connecté, L = local, O = OSPF, D = EIGRP, S* = route statique par défaut."],
  ["srwe:14", "Comment s'écrit la route par défaut IPv4 ?", ["0.0.0.0/0", "255.255.255.255/32", "127.0.0.0/8", "0.0.0.0/32"], "En IPv6 : ::/0."],
  ["srwe:14", "Parmi plusieurs routes qui correspondent à une destination, laquelle le routeur utilise-t-il ?", ["Celle avec le préfixe le plus long", "Celle avec le préfixe le plus court", "La plus ancienne", "Celle avec le plus de sauts"], "La correspondance la plus spécifique gagne (longest prefix match)."],
  ["srwe:14", "Quelle est la distance administrative d'une route statique ?", ["1", "0", "110", "120"], "0 = connecté, 1 = statique, 90 = EIGRP, 110 = OSPF, 120 = RIP."],

  // ===== SRWE 15 · Routes statiques
  ["srwe:15", "Comment s'écrit une route statique IPv6 par défaut ?", ["ipv6 route ::/0 2001:db8::1", "ipv6 route 0.0.0.0 0.0.0.0 2001:db8::1", "ip route ::/0 2001:db8::1", "ipv6 default-gateway 2001:db8::1"], "« ::/0 » est la route par défaut IPv6."],
  ["srwe:15", "Qu'est-ce qu'une route statique entièrement spécifiée ?", ["Une route qui indique l'interface de sortie et le next-hop", "Une route avec un masque /32", "Une route par défaut", "Une route avec une AD de 0"], "Obligatoire en IPv6 quand le next-hop est une link-local."],
  ["srwe:15", "Qu'est-ce qu'une route hôte IPv4 ?", ["Une route avec un masque /32", "Une route vers le réseau de la passerelle", "Une route par défaut", "Une route apprise par DHCP"], "Elle vise une seule adresse."],

  // ===== SRWE 16 · Dépannage des routes
  ["srwe:16", "Quelle commande montre quelle route serait utilisée pour joindre 10.1.5.9 ?", ["show ip route 10.1.5.9", "ping 10.1.5.9", "show arp", "show ip interface brief"], "Elle affiche l'entrée retenue, son next-hop et son AD."],
  ["srwe:16", "Une route statique pointe vers un next-hop que le routeur ne sait pas joindre. Que se passe-t-il ?", ["La route n'est pas installée dans la table", "Elle est installée avec une AD de 255", "Le routeur redémarre", "Elle devient une route par défaut"], "Le next-hop doit être résolu par une autre route (recherche récursive)."],
  ["srwe:16", "Le ping vers un réseau distant échoue mais traceroute montre le premier saut. Quelle est la piste suivante ?", ["Vérifier la table de routage du routeur suivant (aller et retour)", "Changer le câble du PC", "Désactiver le DNS", "Redémarrer le switch d'accès"], "Il faut une route à l'aller et au retour."],

  // ===== ENSA 1 · Concepts OSPF
  ["ensa:1", "Quel paquet OSPF sert à découvrir et maintenir les voisins ?", ["Hello", "LSU", "LSAck", "DBD"], "Les Hello sont envoyés toutes les 10 s sur Ethernet."],
  ["ensa:1", "Quels sont les intervalles Hello et Dead par défaut sur Ethernet ?", ["10 s et 40 s", "5 s et 20 s", "30 s et 120 s", "1 s et 3 s"], "Ils doivent être identiques entre voisins pour former une adjacence."],
  ["ensa:1", "Quelle adresse multicast désigne tous les routeurs OSPF ?", ["224.0.0.5", "224.0.0.6", "224.0.0.9", "224.0.0.10"], "224.0.0.6 = DR et BDR, 224.0.0.9 = RIPv2, 224.0.0.10 = EIGRP."],
  ["ensa:1", "Quel est l'état final d'une adjacence OSPF complète ?", ["Full", "2-Way", "ExStart", "Loading"], "Entre deux DROther, l'état reste 2-Way, et c'est normal."],
  ["ensa:1", "Quel algorithme utilise OSPF pour calculer les meilleurs chemins ?", ["SPF (Dijkstra)", "Bellman-Ford", "DUAL", "Spanning Tree"], "Chaque routeur calcule l'arbre des plus courts chemins depuis sa LSDB."],
  ["ensa:1", "Comment est élu le DR OSPF ?", ["Priorité d'interface la plus haute, puis router ID le plus haut", "Router ID le plus bas", "Le premier routeur allumé uniquement", "L'adresse MAC la plus basse"], "Une priorité de 0 empêche un routeur de devenir DR. L'élection n'est pas préemptive."],

  // ===== ENSA 2 · Configuration OSPF
  ["ensa:2", "Comment empêcher l'envoi de Hello OSPF vers un LAN sans routeur ?", ["passive-interface", "no network", "shutdown", "ip ospf priority 0"], "Le réseau reste annoncé, mais aucun voisin ne peut se former sur cette interface."],
  ["ensa:2", "Quelle commande affiche les voisins OSPF et leur état ?", ["show ip ospf neighbor", "show ip route ospf", "show ip protocols", "show cdp neighbors"], "On y voit l'état (FULL/DR, 2WAY/DROTHER…) et le Dead time."],
  ["ensa:2", "Quelle commande diffuse la route par défaut dans OSPF ?", ["default-information originate", "redistribute static", "ip route 0.0.0.0 0.0.0.0", "network 0.0.0.0 255.255.255.255 area 0"], "Le routeur doit lui-même avoir une route par défaut."],
  ["ensa:2", "Quelle commande adapte le calcul du coût OSPF aux liens gigabit ?", ["auto-cost reference-bandwidth 1000", "bandwidth 1000", "ip ospf cost 1", "speed 1000"], "Par défaut la référence est 100 Mb/s : tout lien de 100 Mb/s ou plus a un coût de 1."],
  ["ensa:2", "Comment activer OSPF directement sur une interface ?", ["ip ospf 10 area 0", "network interface area 0", "router ospf interface", "ospf enable"], "Alternative à la commande « network » sous « router ospf »."],

  // ===== ENSA 3 · Concepts de sécurité
  ["ensa:3", "Une attaque menée depuis des milliers de machines infectées est…", ["Un DDoS", "Un phishing", "Un ping sweep", "Une attaque par force brute"], "Les machines zombies forment un botnet."],
  ["ensa:3", "Un mail piégé qui vise précisément le comptable d'Ar Mor est…", ["Du spear phishing", "Du vishing", "Du smishing", "Du whaling"], "Le whaling vise les dirigeants, le vishing passe par téléphone, le smishing par SMS."],
  ["ensa:3", "Quel algorithme est symétrique ?", ["AES", "RSA", "Diffie-Hellman", "ECDSA"], "Même clé pour chiffrer et déchiffrer. RSA est asymétrique."],
  ["ensa:3", "Quel mécanisme garantit l'intégrité d'un fichier ?", ["Le hachage (SHA-256)", "Le chiffrement AES", "La compression", "Le NAT"], "Une empreinte différente signifie un fichier modifié."],

  // ===== ENSA 4 · Concepts ACL
  ["ensa:4", "Quelle est la plage des ACL IPv4 standard numérotées ?", ["1 à 99 (et 1300 à 1999)", "100 à 199", "1 à 199", "200 à 299"], "Les ACL étendues utilisent 100-199 et 2000-2699."],
  ["ensa:4", "Comment une ACL est-elle évaluée ?", ["De haut en bas, et la première correspondance s'applique", "Toutes les lignes sont évaluées", "De bas en haut", "La règle la plus spécifique gagne"], "L'ordre des lignes est donc crucial."],
  ["ensa:4", "Où placer une ACL étendue ?", ["Au plus près de la source", "Au plus près de la destination", "Sur le switch d'accès", "N'importe où"], "Elle est précise, donc on jette le trafic indésirable le plus tôt possible."],
  ["ensa:4", "Combien d'ACL IPv4 peut-on appliquer sur une interface ?", ["Une par direction (entrée et sortie)", "Autant qu'on veut", "Une seule, toutes directions", "Deux par direction"], "Une par protocole, par direction, par interface."],

  // ===== ENSA 5 · Configuration des ACL
  ["ensa:5", "À quel masque générique équivaut le mot-clé « host » ?", ["0.0.0.0", "255.255.255.255", "0.0.0.255", "255.255.255.0"], "« host 10.1.1.1 » = « 10.1.1.1 0.0.0.0 ». Et « any » = « 0.0.0.0 255.255.255.255 »."],
  ["ensa:5", "Quelle commande applique une ACL aux lignes VTY ?", ["access-class", "ip access-group", "access-list vty", "transport input"], "« ip access-group » s'applique aux interfaces."],
  ["ensa:5", "Comment créer une ACL nommée standard ?", ["ip access-list standard NOM", "access-list NOM standard", "ip acl NOM", "access-list standard NOM permit"], "On entre ensuite les lignes permit/deny en mode de configuration d'ACL."],
  ["ensa:5", "Quelle commande affiche les ACL avec leurs compteurs de correspondances ?", ["show access-lists", "show ip interface brief", "show running-config | section line", "show ip route"], "Les compteurs montrent quelles lignes sont réellement utilisées."],

  // ===== ENSA 6 · NAT
  ["ensa:6", "Dans la terminologie NAT, qu'est-ce que l'adresse « inside local » ?", ["L'adresse privée de l'hôte interne", "L'adresse publique de l'hôte interne", "L'adresse du serveur Internet", "L'adresse du FAI"], "Inside global = l'adresse publique qui représente cet hôte sur Internet."],
  ["ensa:6", "Quand utiliser du NAT statique ?", ["Pour rendre un serveur interne joignable depuis Internet", "Pour faire sortir tous les PC avec une seule IP", "Pour router entre VLAN", "Pour économiser des adresses IPv6"], "Correspondance fixe un pour un."],
  ["ensa:6", "Quelle commande affiche les traductions NAT actives ?", ["show ip nat translations", "show ip nat statistics", "show nat", "debug ip nat"], "« clear ip nat translation * » les efface."],

  // ===== ENSA 7 · WAN
  ["ensa:7", "Quelle technologie d'opérateur achemine les paquets grâce à des étiquettes ?", ["MPLS", "DSL", "PPP", "Frame Relay"], "MPLS se base sur des labels plutôt que sur l'adresse IP de destination."],
  ["ensa:7", "Quelle topologie WAN relie chaque agence au seul siège ?", ["Hub-and-spoke", "Full mesh", "Point-à-point", "Anneau"], "Économique, mais le siège devient un point unique de défaillance."],
  ["ensa:7", "Quelle technologie d'accès utilise la ligne téléphonique cuivre ?", ["DSL", "Câble DOCSIS", "Fibre FTTH", "4G"], "Le DSL partage la paire cuivre avec la téléphonie."],

  // ===== ENSA 8 · VPN et IPsec
  ["ensa:8", "Quel protocole IPsec assure le chiffrement ?", ["ESP", "AH", "IKE", "GRE"], "AH garantit authenticité et intégrité, sans chiffrement."],
  ["ensa:8", "À quoi sert Diffie-Hellman dans un VPN ?", ["À établir une clé secrète partagée sur un canal non sûr", "À chiffrer les données", "À compresser les paquets", "À authentifier les utilisateurs par mot de passe"], "Utilisé par IKE pour négocier les clés."],
  ["ensa:8", "Un tunnel GRE seul…", ["N'est pas chiffré", "Est chiffré en AES", "Ne transporte que de l'IPv6", "Remplace IPsec"], "On combine souvent GRE (multicast, routage) et IPsec (chiffrement)."],
  ["ensa:8", "Les commerciaux d'Ar Mor se connectent au réseau depuis l'hôtel. Quel type de VPN ?", ["VPN d'accès distant", "VPN site-à-site", "MPLS", "GRE multipoint"], "Le site-à-site relie deux réseaux entiers, par exemple Brest et Quimper."],

  // ===== ENSA 9 · QoS
  ["ensa:9", "Quelle latence maximale vise-t-on pour la voix sur IP (un sens) ?", ["150 ms", "1 s", "500 ms", "10 ms"], "Et une gigue sous 30 ms, avec moins de 1 % de pertes."],
  ["ensa:9", "Quelle valeur DSCP marque habituellement la voix ?", ["EF (46)", "AF11 (10)", "CS1 (8)", "0 (best effort)"], "Expedited Forwarding : traitement prioritaire."],
  ["ensa:9", "Quelle file d'attente donne une priorité stricte à la voix ?", ["LLQ", "FIFO", "WFQ", "Tail drop"], "Low Latency Queuing ajoute une file prioritaire à CBWFQ."],
  ["ensa:9", "Quelle différence entre shaping et policing ?", ["Le shaping met le surplus en tampon, le policing le jette ou le remarque", "Le policing met en tampon, le shaping jette", "Aucune", "Le shaping ne s'applique qu'à l'entrée"], "Le shaping lisse le trafic sortant."],

  // ===== ENSA 10 · Gestion du réseau
  ["ensa:10", "Sur quel port écoute un agent SNMP ?", ["UDP 161", "UDP 162", "TCP 161", "UDP 514"], "162 = traps, 514 = Syslog."],
  ["ensa:10", "Quelle version de SNMP apporte authentification et chiffrement ?", ["SNMPv3", "SNMPv2c", "SNMPv1", "SNMPv2"], "v1 et v2c utilisent des communautés en clair."],
  ["ensa:10", "En Syslog, quel est le niveau le plus grave ?", ["0 (emergencies)", "7 (debugging)", "4 (warnings)", "3 (errors)"], "Plus le chiffre est petit, plus c'est grave."],
  ["ensa:10", "Un serveur NTP de stratum 1 est…", ["Directement relié à une horloge de référence", "Le moins précis", "Relié à un serveur stratum 2", "Un client uniquement"], "Stratum 0 = horloge atomique/GPS, stratum 1 = serveur directement connecté."],
  ["ensa:10", "Quel est l'équivalent standard de CDP ?", ["LLDP", "SNMP", "STP", "LACP"], "Link Layer Discovery Protocol, IEEE 802.1AB."],

  // ===== ENSA 11 · Conception
  ["ensa:11", "Quelles sont les trois couches du modèle hiérarchique Cisco ?", ["Accès, distribution, cœur", "Physique, liaison, réseau", "Client, serveur, cloud", "Edge, fog, cloud"], "Les PC se branchent en accès, la distribution agrège et applique les politiques, le cœur commute vite."],
  ["ensa:11", "Que fait une conception « collapsed core » ?", ["Elle fusionne les couches cœur et distribution", "Elle supprime la couche accès", "Elle double le cœur", "Elle supprime la redondance"], "Courant dans les sites de taille moyenne."],
  ["ensa:11", "Quel est le rôle principal de la couche cœur ?", ["Transporter le trafic très vite avec de la redondance", "Appliquer les ACL utilisateurs", "Brancher les postes", "Distribuer les adresses DHCP"], "On évite d'y mettre des traitements lourds."],

  // ===== ENSA 12 · Dépannage
  ["ensa:12", "Qu'est-ce qu'une baseline réseau ?", ["Une référence des performances normales", "Le premier switch installé", "Une sauvegarde de configuration", "Un câble de test"], "Sans baseline, difficile de savoir ce qui est anormal."],
  ["ensa:12", "Quelle méthode de dépannage commence par une couche du milieu, puis monte ou descend selon le résultat ?", ["Diviser pour régner", "Ascendante", "Descendante", "Suivre le chemin"], "On teste souvent d'abord la couche 3 (ping), puis on oriente la recherche."],
  ["ensa:12", "Quel outil capture et analyse les paquets ?", ["Wireshark", "PuTTY", "TFTPd", "Packet Tracer"], "Indispensable pour voir ce qui circule vraiment."],

  // ===== ENSA 13 · Virtualisation
  ["ensa:13", "Qu'est-ce qu'un hyperviseur de type 1 ?", ["Un hyperviseur qui s'installe directement sur le matériel", "Un hyperviseur installé dans Windows", "Un conteneur Docker", "Une machine virtuelle"], "Comme Proxmox VE ou ESXi. Type 2 = VirtualBox, VMware Workstation."],
  ["ensa:13", "Que sépare le SDN ?", ["Le plan de contrôle et le plan de données", "Les VLAN et les sous-réseaux", "IPv4 et IPv6", "Le LAN et le WAN"], "Le contrôleur centralise les décisions, les équipements se contentent de transmettre."],
  ["ensa:13", "Gmail ou Microsoft 365 sont des exemples de…", ["SaaS", "IaaS", "PaaS", "On-premise"], "IaaS = infrastructure (VM), PaaS = plateforme pour développer."],
  ["ensa:13", "Les API « northbound » d'un contrôleur SDN communiquent avec…", ["Les applications", "Les switchs et routeurs", "Les câbles", "Le FAI"], "Les API southbound parlent aux équipements (ex. OpenFlow, NETCONF)."],

  // ===== ENSA 14 · Automatisation
  ["ensa:14", "Quel format de données utilise des accolades et des paires clé/valeur entre guillemets ?", ["JSON", "YAML", "XML", "CSV"], "YAML repose sur l'indentation, XML sur des balises."],
  ["ensa:14", "Quelle méthode HTTP d'une API REST sert à lire une ressource ?", ["GET", "POST", "PUT", "DELETE"], "POST = créer, PUT/PATCH = modifier, DELETE = supprimer."],
  ["ensa:14", "Quel code HTTP signifie que la requête a réussi ?", ["200", "404", "500", "301"], "404 = introuvable, 500 = erreur serveur, 401 = non authentifié."],
  ["ensa:14", "Quel outil d'automatisation fonctionne sans agent sur les équipements, via SSH ?", ["Ansible", "Puppet", "Chef", "SNMP"], "Ses playbooks sont écrits en YAML."]
];
if (typeof module !== 'undefined') module.exports = QBANK;
