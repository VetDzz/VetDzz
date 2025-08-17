Summary of UI translation updates

- Navbar
  - Replace hard-coded "Se Déconnecter" with t('nav.logout')
  - Replace "Demandes PAD" menu for labs with t('nav.PADRequests')

- Notifications Dropdown
  - Localize title and refresh: t('notifications.title'), t('common.refresh')

- Find Laboratory
  - Request PAD button uses t('map.requestPAD')
  - "Aller à l'emplacement" uses t('findLab.goLocation') and keeps in-app map centering
  - "Appeler" uses t('findLab.call')

- Accurate Map
  - Localize Refresh Position, Go to my place, and unknown position toast

- Results History
  - Localize status badges and Download button

- Laboratory Dashboard
  - Localize header, tabs, cards, statuses, and action buttons

- LanguageContext additions
  - Added keys for nav.logout, nav.PADRequests, map.*, notifications.*, findLab.goLocation
  - Added extensive lab.* keys for Laboratory Dashboard
  - Added results.* keys for status and download

Next steps
- Review any other pages with hard-coded French strings and we can wire them to the t() function as needed.

