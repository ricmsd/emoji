import { Component, OnInit } from '@angular/core';
import { FilterMetadata, MenuItem, TreeNode } from 'primeng/api';
import { EmojiService } from 'src/service/emoji.service';
import { MessageService } from 'primeng/api';
import { TableFilterEvent } from 'primeng/table';

const StorageKey = {
  Settings: <string>'settings-0.0.1'
} as const;

interface Column {
  field: string;
  header: string;
  filterMatchMode: string;
}

declare var twemoji: {
  convert: {
    fromCodePoint(str: string): string;
    toCodePoint(str: string): string;
  },
  parse(str: string, options?: { folder: string, ext: string }): string;
};

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  providers: [MessageService]
})
export class AppComponent implements OnInit {
  public emojiTree!: TreeNode[];
  public emojiTreeForFilter!: TreeNode[];
  private savedSelectedGroupKey!: string;
  public selectedGroup!: TreeNode;
  public emojis!: any[];
  public selectedEmoji!: any;
  public detailedEmoji!: any;

  public filters: {[s: string]: FilterMetadata | FilterMetadata[]} = 
    {
      emoji: { value: null, matchMode: 'equals' },
      nameEn: { value: null, matchMode: 'contains' }
    };

  public displayModeValue: 'list' | 'grid' = 'list';
  public displayModeOptions: any[] = [
      { icon: 'pi pi-list', value: 'list' },
      { icon: 'pi pi-th-large', value: 'grid' },
  ];
  public iconSizeValue: number = 65;

  public readonly GRID_SLIDER_MIN = 30;
  public readonly GRID_SLIDER_MAX = 100;
  public readonly GRID_SLIDER_STEP = 5;

  public enableTwEmoji: boolean = false;
  public menuItems: MenuItem[] = [
    { label: 'Preferences', icon: 'pi pi-cog', command: () => { this.preferencesVisible = true; } },
    { label: 'Licenses', icon: 'pi pi-external-link', url: './assets/licenses.html' },
    { label: 'GitHub', icon: 'pi pi-github', url: 'https://github.com/ricmsd/emoji' },
  ];
  public preferencesVisible: boolean = false;
  public emojiStatuses: string[] = ['component', 'fully-qualified', 'minimally-qualified', 'unqualified'];
  public selectedEmojiStatus: string[] = ['fully-qualified'];
  public skinTones: string[] = ['light skin tone', 'medium-light skin tone', 'medium skin tone', 'medium-dark skin tone', 'dark skin tone'];
  public selectedSkinTones: string[] = [];
  public reSelectedSkinTones?: RegExp;
  static readonly RE_NAME_SKIN_TONE = /(.+): (.+)skin tone/;

  constructor(
    private emojiService: EmojiService,
    private messageService: MessageService) {
    this.loadSettings();
    this.updateReSelectedSkinTone();
  }

  private loadSettings(): void {
    const defaultSettings = {
      displayModeValue: 'list',
      iconSizeValue: 65,
      selectedEmojiStatus: ['fully-qualified'],
      enableTwEmoji: false,
      selectedGroupKey: 'allgroup',
      selectedSkinTones: [...this.skinTones],
    };
    const settingsJSON = localStorage.getItem(StorageKey.Settings);
    const settings = settingsJSON ? JSON.parse(settingsJSON) : defaultSettings;
    this.displayModeValue = settings.displayModeValue;
    this.iconSizeValue = settings.iconSizeValue;
    this.selectedEmojiStatus = settings.selectedEmojiStatus;
    this.enableTwEmoji = settings.enableTwEmoji;
    this.savedSelectedGroupKey = settings.selectedGroupKey;
    this.selectedSkinTones = settings.selectedSkinTones;
  }
  public saveSettings(): void {
    localStorage.setItem(StorageKey.Settings, JSON.stringify({
      displayModeValue: this.displayModeValue,
      iconSizeValue: this.iconSizeValue,
      selectedEmojiStatus: this.selectedEmojiStatus,
      enableTwEmoji: this.enableTwEmoji,
      selectedGroupKey: this.selectedGroup.key,
      selectedSkinTones: this.selectedSkinTones,
    }));
    this.savedSelectedGroupKey = <string>this.selectedGroup.key;
  }

  ngOnInit(): void {
    this.emojiService.getEmoji().then((emojiTree) => {
      this.emojiTree = emojiTree;
      this.updateEmojiTree();
    });
  }

  private isDisplayEmoji(data: any): boolean {
    // check skine tone.
    let matchSkinTone = true;
    const nameEn: string = data['nameEn'];
    if (nameEn.match(AppComponent.RE_NAME_SKIN_TONE)) {
      if (this.selectedSkinTones.length === 0) {
        matchSkinTone = false;
      } else {
        matchSkinTone = !!nameEn.match(<RegExp>this.reSelectedSkinTones);
      }
    }
    // check status
    return this.selectedEmojiStatus.includes(data['status']) && matchSkinTone;
  }

  public updateEmojiTree(): void {
    let selectedGroup;
    const allgroup: TreeNode = {
      label: 'All Group',
      data: { children: [], data: { type: 'allgroup' } },
      children: [],
      key: 'allgroup',
      expanded: true
    };
    const treeForFilter: TreeNode[] = [allgroup];
    this.emojiTree.forEach(i => {
      const group: TreeNode = {
        label: i.data['nameEn'],
        data: i,
        children: [],
        key: i.data['id']
      };
      i.data['treeNode'] = group;
      if (group.key === this.savedSelectedGroupKey) {
        selectedGroup = group;
      }
      allgroup.children?.push(group);
      allgroup.data.children.push(i);
      i.children?.forEach(j => {
        const subgroup: TreeNode = {
          label: j.data['nameEn'],
          data: j,
          key: j.data['id']
        };
        j.data['treeNode'] = subgroup;
        if (subgroup.key === this.savedSelectedGroupKey) {
          selectedGroup = subgroup;
        }
        group.children?.push(subgroup);
      });
    });

    this.emojiTreeForFilter = treeForFilter;
    this.selectedGroup = selectedGroup ? selectedGroup : allgroup;

    // add emoji count to group/subgroup label;
    const counter = (node: TreeNode) => {
      if (!node.children) {
        return node.data.children.filter((i: any) => this.isDisplayEmoji(i['data'])).length;
      } else {
        let total = 0;
        for (let child of node.children || []) {
          const count = counter(child);
          child.label += ` (${count})`;
          total += count;
        }
        return total;
      }
    };
    const count = counter(allgroup);
    allgroup.label += ` (${count})`;

    this.updateEmojis();
  }

  public updateEmojis(): void {
    const emojis: any[] = [];
    const pushEmojis = (node: TreeNode) => {
      if (node.data['type'] === 'emoji' && this.isDisplayEmoji(node.data)) {
        emojis.push(node.data);
      } else {
        node.children?.forEach(i => {
          pushEmojis(i);
        });
      }
    };
    pushEmojis(this.selectedGroup.data);
    this.emojis = emojis;
  }

  public writeText(text: string): void {
    navigator.clipboard.writeText(text);
    this.messageService.clear();
    this.messageService.add({ severity: 'success', summary: 'Copied!', detail: `"${text}" copied to clipboard.`, sticky: false }, );
  }

  public getSeverity(status: string) {
    switch(status) {
      case 'component':
        return 'success';
      case 'unqualified':
        return 'danger';
      case 'minimally-qualified':
        return 'warning';
    }
    return 'info';
  }

  public onRowSelect(): void {
    this.detailedEmoji = this.selectedEmoji;
  }
  public onRowMouseEnter(emoji: any): void {
    if (!this.selectedEmoji) {
      this.detailedEmoji = emoji;
    }
  }
  public onGridItemSelect(emoji: any): void {
    if (this.selectedEmoji === emoji) {
      this.selectedEmoji = null;
    } else {
      this.selectedEmoji = emoji;
      this.detailedEmoji = this.selectedEmoji;
    }
  }
  public onGridItemMouseEnter(emoji: any): void {
    if (!this.selectedEmoji) {
      this.detailedEmoji = emoji;
    }
  }

  public onMouseWheelInGrid(event: any): void {
    const wheelEvent = <WheelEvent>event;
    if (!wheelEvent.ctrlKey) {
      return;
    }
    wheelEvent.preventDefault();
    if (wheelEvent.deltaY < 0) {
      if (this.iconSizeValue < this.GRID_SLIDER_MAX) {
        this.iconSizeValue += this.GRID_SLIDER_STEP;
        this.saveSettings();
      }
    } else if (wheelEvent.deltaY > 0) {
      if (this.iconSizeValue > this.GRID_SLIDER_MIN) {
        this.iconSizeValue -= this.GRID_SLIDER_STEP;
        this.saveSettings();
      }
    }
  }

  public toTwEmojiURL(unicode: string): string {
    if (!unicode) {
      return '';
    }
    try {
      const codePoint = twemoji.convert.toCodePoint(unicode)
      return `https://cdn.jsdelivr.net/gh/jdecked/twemoji@latest/assets/svg/${codePoint}.svg`;
    } catch (e) {
      console.log(e);
      return '';
    }
  }
  public onTwEmojiLoaded(element: HTMLImageElement, icon: HTMLElement): void {
    element.style.opacity = '1';
    icon.remove();
  }
  public onTwEmojiLoadError(emoji: any, element: HTMLImageElement, icon: HTMLElement): void {
    const parent = element.parentElement;
    element.remove();
    icon.classList.remove('pi-spin', 'pi-spinner');
    icon.classList.add('pi-ban');
    emoji['twEmojiNotFound'] = true;
  }

  public onTwEmojiDetailLoad(image: HTMLElement, icon: HTMLElement): void {
    image.classList.remove('hidden');
    image.style.opacity = '1';
    icon.classList.add('hidden');
  }
  public onTwEmojiDetailLoadError(emoji: any, image: HTMLElement, icon: HTMLElement): void {
    image.classList.add('hidden');
    image.style.opacity = '0';
    if (emoji) {
      icon.classList.remove('hidden');
      emoji['twEmojiNotFound'] = true;
    }
  }

  public getSkinToneLabel(skinTone: string): string {
    switch(skinTone) {
      case 'light skin tone':
        return skinTone + ' (&#x1F91A;&#x1F3FB;)';
      case 'medium-light skin tone':
        return skinTone + ' (&#x1F91A;&#x1F3FC;)';
      case 'medium skin tone':
        return skinTone + ' (&#x1F91A;&#x1F3FD;)';
      case 'medium-dark skin tone':
        return skinTone + ' (&#x1F91A;&#x1F3FE;)';
      case 'dark skin tone':
        return skinTone + ' (&#x1F91A;&#x1F3FF;)';
    }
    return '';
  }

  public updateReSelectedSkinTone(): void {
    this.reSelectedSkinTones = new RegExp('[:,] (' + this.selectedSkinTones.join('|') + ')');
  }

  public onClickClosePreferences(): void {
    this.preferencesVisible = false;
    this.updateReSelectedSkinTone();
    this.updateEmojiTree();
  }

  public onTableRowFiltered(event: TableFilterEvent): void {
    this.filters = <{[s: string]: FilterMetadata}>event.filters;
  }
}
