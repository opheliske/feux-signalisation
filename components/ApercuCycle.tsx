import React from "react";
import { View, Text, StyleSheet } from "react-native";
import {
  Etape,
  couleurPastille,
  dureeTotaleCycle,
  espacements,
  typo,
  rayons,
} from "../theme";

type Props = {
  etapes: Etape[];
};

export default function ApercuCycle({ etapes }: Props) {
  if (etapes.length === 0) return null;
  const total = dureeTotaleCycle(etapes);

  return (
    <View
      style={styles.conteneur}
      accessibilityLabel={`Aperçu du cycle : ${total} secondes au total, puis ça recommence`}
    >
      <View style={styles.barre}>
        {etapes.map((etape, i) => (
          <View
            key={etape.id}
            style={[
              styles.segment,
              {
                flex: etape.dureeSecondes,
                borderTopLeftRadius: i === 0 ? rayons.carte : 0,
                borderBottomLeftRadius: i === 0 ? rayons.carte : 0,
                borderTopRightRadius: i === etapes.length - 1 ? rayons.carte : 0,
                borderBottomRightRadius:
                  i === etapes.length - 1 ? rayons.carte : 0,
              },
            ]}
          >
            {etape.lampes.map((lampe, j) => (
              <View
                key={lampe}
                style={[
                  styles.bande,
                  {
                    flex: 1,
                    backgroundColor: couleurPastille(lampe),
                    borderTopWidth:
                      j > 0 ? StyleSheet.hairlineWidth : 0,
                    borderTopColor: "rgba(0,0,0,0.2)",
                  },
                ]}
              />
            ))}
          </View>
        ))}
      </View>
      <View style={styles.pied}>
        <Text style={styles.texte}>Durée du cycle : {total} s</Text>
        <Text style={styles.texte}>puis ça recommence</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  conteneur: { gap: espacements.xs },
  barre: {
    flexDirection: "row",
    height: 20,
    borderRadius: rayons.carte,
    overflow: "hidden",
  },
  segment: { flexDirection: "column", overflow: "hidden" },
  bande: {},
  pied: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  texte: { ...typo.petit },
});
