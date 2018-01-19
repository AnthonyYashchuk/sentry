import addForm from '../../utils/addForm';

const formGroups = [
  {
    // Form "section"/"panel"
    title: 'Add Secondary Emails',
    fields: [
      {
        name: 'email',
        type: 'string',

        // additional data/props that is related to rendering of form field rather than data
        label: 'Additional Email',
        placeholder: 'e.g. secondary@example.com',
        help: 'Designate an alternative email for this account',
      },
    ],
  },
];

export default addForm({
  route: '/settings/account/emails/',
  formGroups,
});
