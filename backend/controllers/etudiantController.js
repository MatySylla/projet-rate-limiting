let etudiants = [];

export function getEtudiants(req, res) {
  res.json(etudiants);
}

export function addEtudiant(req, res) {
  const { nom, prenom, email } = req.body;
  const newEtudiant = { id: etudiants.length + 1, nom, prenom, email };
  etudiants.push(newEtudiant);
  res.json({ message: "Etudiant ajouté", etudiant: newEtudiant });
}

export function updateEtudiant(req, res) {
  const { id } = req.params;
  const { nom, prenom, email } = req.body;

  const etu = etudiants.find(e => e.id == id);
  if (!etu) return res.status(404).json({ message: "Etudiant non trouvé" });

  etu.nom = nom || etu.nom;
  etu.prenom = prenom || etu.prenom;
  etu.email = email || etu.email;

  res.json({ message: "Etudiant modifié", etudiant: etu });
}

export function deleteEtudiant(req, res) {
  const { id } = req.params;
  const index = etudiants.findIndex(e => e.id == id);
  if (index === -1) return res.status(404).json({ message: "Etudiant non trouvé" });

  const removed = etudiants.splice(index, 1);
  res.json({ message: "Etudiant supprimé", etudiant: removed[0] });
}
