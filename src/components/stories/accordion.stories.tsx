import { Meta, StoryObj } from '@storybook/react-vite';
import { Accordion } from '../ui/accordion';


const meta: Meta<typeof Accordion> = {
    title: 'Accordion',
    component: Accordion
};

export default meta;
type Story = StoryObj<typeof Accordion>;

export const base: Story = {
    args: {
        children: 'Accordion Content',
    },
}