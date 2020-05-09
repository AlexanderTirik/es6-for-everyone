import { controls } from '../../constants/controls';
import { fighters } from '../helpers/mockData';

export async function fight(firstFighter, secondFighter) {
  return new Promise((resolve) => {
    let pressed = new Set();

    const leftFighter = createCombatFighter(firstFighter, "left")
    const rightFighter = createCombatFighter(secondFighter, "right")

    document.addEventListener('keydown', function (event) {
      pressed.add(event.code);

      // First attack
      if (
        event.code === controls.PlayerOneAttack &&
        !pressed.has(controls.PlayerOneBlock) &&
        !pressed.has(controls.PlayerTwoBlock) &&
        !event.repeat
      ) {
        Hit(leftFighter, rightFighter);
      }

      // Second attack
      if (
        event.code === controls.PlayerTwoAttack &&
        !pressed.has(controls.PlayerTwoBlock) &&
        !pressed.has(controls.PlayerOneBlock) &&
        !event.repeat
      ) {
        Hit(rightFighter, leftFighter);
      }

      if (controls.PlayerOneCriticalHitCombination.every((code) => pressed.has(code))) {
        Hit(leftFighter, rightFighter, true);
      }

      if (controls.PlayerTwoCriticalHitCombination.every((code) => pressed.has(code))) {
        Hit(rightFighter, leftFighter, true);
      }

      if (rightFighter.health <= 0) resolve(firstFighter);
      if (leftFighter.health <= 0) resolve(secondFighter);
    });

    document.addEventListener('keyup', function (event) {
      pressed.delete(event.code);
    });
  });
}

export function getDamage(attacker, defender) {
  const damage = getHitPower(attacker) - getBlockPower(defender);
  return damage < 0 ? 0 : damage;
}

export function getHitPower(fighter) {
  const attack = fighter.attack;
  const criticalHitChance = 1 + Math.random();
  const power = attack * criticalHitChance;
  return power;
}

export function getBlockPower(fighter) {
  const defense = fighter.defense;
  const dodgeChance = 1 + Math.random();
  const power = defense * dodgeChance;
  return power;
}

export function Hit(attacker, defender, isCrit = false) {
  if (isCrit) {
    defender.health -= attacker.attack * 2;
    
  } else {
    defender.health -= getDamage(attacker, defender);
  }
  const percentHealth = defender.health > 0 ? Math.floor((defender.health / defender.fullHealth) * 100) : 0;
  defender.healthBar.style.width = `${percentHealth}%`;
}

export function createCombatFighter(fighter, position){
  return {
    ...fighter,
    fullHealth: fighter.health,
    cooldownCrit: new Date(),
    healthBar: document.getElementById(`${position}-fighter-indicator`)
  }
}
