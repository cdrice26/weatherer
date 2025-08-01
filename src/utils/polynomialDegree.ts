export const getDegreeText = (degree: number) => {
  switch (degree) {
    case 1:
      return 'linear';
    case 2:
      return 'quadratic';
    case 3:
      return 'cubic';
    case 4:
      return 'quartic';
    case 5:
      return 'quintic';
    default:
      return `${degree}-th degree polynomial`;
  }
};
