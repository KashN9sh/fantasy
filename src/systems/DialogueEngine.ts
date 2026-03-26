import { GameState, GameStateData } from './GameState';

export interface DialogueChoice {
  text: string;
  next: string;
  effects?: Partial<Pick<GameStateData, 'acceptance' | 'care' | 'selfKnowledge' | 'trust'>>;
  setFlag?: string;
  addItem?: string;
  diaryEntry?: { id: string; title: string; text: string };
}

export interface DialogueNode {
  id: string;
  speaker?: string;
  text: string;
  choices?: DialogueChoice[];
  next?: string;
  effects?: Partial<Pick<GameStateData, 'acceptance' | 'care' | 'selfKnowledge' | 'trust'>>;
  setFlag?: string;
  addItem?: string;
  diaryEntry?: { id: string; title: string; text: string };
  condition?: string;
}

export interface DialogueTree {
  id: string;
  startNode: string;
  nodes: DialogueNode[];
}

export class DialogueEngine {
  private tree: DialogueTree | null = null;
  private currentNode: DialogueNode | null = null;

  load(tree: DialogueTree): DialogueNode | null {
    this.tree = tree;
    return this.goTo(tree.startNode);
  }

  getCurrent(): DialogueNode | null {
    return this.currentNode;
  }

  advance(choiceIndex?: number): DialogueNode | null {
    if (!this.currentNode || !this.tree) return null;

    this.applyNodeEffects(this.currentNode);

    if (this.currentNode.choices && choiceIndex !== undefined) {
      const choice = this.currentNode.choices[choiceIndex];
      if (!choice) return null;
      this.applyChoiceEffects(choice);
      return this.goTo(choice.next);
    }

    if (this.currentNode.next) {
      return this.goTo(this.currentNode.next);
    }

    this.currentNode = null;
    return null;
  }

  private goTo(nodeId: string): DialogueNode | null {
    if (!this.tree) return null;
    if (nodeId === 'END') {
      this.currentNode = null;
      return null;
    }

    const node = this.tree.nodes.find(n => n.id === nodeId);
    if (!node) {
      this.currentNode = null;
      return null;
    }

    if (node.condition && !GameState.hasFlag(node.condition)) {
      if (node.next) return this.goTo(node.next);
      this.currentNode = null;
      return null;
    }

    this.currentNode = node;
    return node;
  }

  private applyNodeEffects(node: DialogueNode): void {
    if (node.effects) GameState.applyEffects(node.effects);
    if (node.setFlag) GameState.setFlag(node.setFlag);
    if (node.addItem) GameState.addItem(node.addItem);
    if (node.diaryEntry) GameState.addDiaryEntry(node.diaryEntry);
  }

  private applyChoiceEffects(choice: DialogueChoice): void {
    if (choice.effects) GameState.applyEffects(choice.effects);
    if (choice.setFlag) GameState.setFlag(choice.setFlag);
    if (choice.addItem) GameState.addItem(choice.addItem);
    if (choice.diaryEntry) GameState.addDiaryEntry(choice.diaryEntry);
  }
}
